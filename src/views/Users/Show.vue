<template>
  <div class="">
    <v-card class="mx-auto" tile max-width="680px">
      <v-container v-if="user">
        <v-row>
          <v-col
            class="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 d-xl-none d-lg-none d-md-none d-block"
          >
            <div>
              <v-avatar size="120" v-if="!user.icon_url">
                <v-img src="@/assets/blue-error-background.jpg"></v-img>
              </v-avatar>
              <v-avatar v-else size="120">
                <v-img :src="user.icon_url" />
              </v-avatar>
              <!-- <div>
                <span class="d-block about-title">About Me</span>
              </div> -->
            </div>
          </v-col>
          <v-col
            class="col-xl-9 col-lg-9 col-md-9 col-sm-12 col-12 d-sm-flex justify-sm-center"
          >
            <v-container fluid>
              <div class="d-flex justify-center flex-column">
                <div class="d-flex align-center">
                  <div>
                    <span class="text-capitalize font-weight-bold display-1">{{
                      user.display_name
                    }}</span>
                  </div>
                  <div>
                    <v-btn
                      small
                      white
                      outlined
                      class="ml-5"
                      v-if="$store.state.user.id != $route.params.id"
                      @click="!isFollower ? addFollow() : deleteFollow()"
                    >
                      {{ isFollowerText }}
                    </v-btn>
                  </div>
                </div>

                <span v-if="!user.description" class="d-block my-4 description"
                  >Hi, I'm {{ user.display_name }}.</span
                >
                <span
                  v-else
                  class="d-block my-2"
                  v-html="user.description"
                ></span>
                <div class="my-4">
                  <router-link :to="{name: 'user-following', params: {userId: user.id}}" class="mr-4">
                    <span class="font-weight-light"> {{ followingCount }} Following</span>
                  </router-link>

                  <router-link :to="{name: 'user-followers', params: {userId: user.id}}">
                    <span class="font-weight-light"> {{ followersCount }} Followers</span>
                  </router-link>
                </div>
                <span class="blue-grey--text text">
                  Medium member since {{ user.createdAt | formatUserDate }}
                </span>
                <router-link
                  :to="{ name: 'user-followers' }"
                  class="inline-block"
                >
                </router-link>
                <router-link
                  :to="{ name: 'user-following' }"
                  class="inline-block"
                >
                </router-link>
                <v-btn
                  small
                  absolute
                  bottom
                  left
                  fab
                  dark
                  color="white"
                  :to="{
                    path: `/users/${$store.state.user.display_name
                      .toLowerCase()
                      .replace(/\s/g, '')}/${$store.state.user.id}/edit`,
                  }"
                  v-if="$store.state.user.id == $route.params.id"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </div>
              <div class="d-flex align-center">
                <v-btn
                  icon
                  v-if="user.facebook_url"
                  class="mr-4"
                  large
                  target="_blank"
                  :href="user.facebook_url"
                >
                  <v-icon color="#4267B2">mdi-facebook</v-icon>
                </v-btn>
                <v-btn
                  icon
                  large
                  v-if="user.instagram_url"
                  class="mr-4"
                  target="_blank"
                  :href="user.instagram_url"
                >
                  <v-icon color="#4267B2">mdi-instagram</v-icon>
                </v-btn>
                <v-btn
                  icon
                  large
                  v-if="user.linkedin_url"
                  class="mr-4"
                  target="_blank"
                  :href="user.linkedin_url"
                >
                  <v-icon color="#4267B2">mdi-linkedin</v-icon>
                </v-btn>
                <v-btn
                  large
                  icon
                  v-if="user.twitter_url"
                  class="mr-4"
                  target="_blank"
                  :href="user.twitter_url"
                >
                  <v-icon color="#4267B2">mdi-twitter</v-icon>
                </v-btn>
              </div>
            </v-container>
          </v-col>
          <v-col
            class="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 d-xl-block d-lg-block d-md-block d-none"
          >
            <div>
              <v-avatar size="120" v-if="!user.icon_url">
                <v-img src="@/assets/blue-error-background.jpg"></v-img>
              </v-avatar>
              <v-avatar v-else size="120">
                <v-img :src="user.icon_url" />
              </v-avatar>
              <!-- <div>
                <span class="d-block about-title">About Me</span>
              </div> -->
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
    <v-card class="mx-auto my-10" tile flat max-width="680px">
      <ProfileMetadata>
        <template v-slot:userStories>
          <span v-if="stories.length" class="d-block title">My Stories</span>
          <div v-for="story in stories" :key="story.id">
            <UserStory :story="story" />
          </div>
        </template>
      </ProfileMetadata>
    </v-card>
  </div>
</template>

<script>
import UserStory from "@/components/Card-Recommended";
import ProfileMetadata from "@/views/Users/ProfileMetadata";
import FollowService from "@/services/FollowService";
import StoryService from "@/services/StoryService";
import UserService from "@/services/UserService";
export default {
  components: {
    UserStory,
    ProfileMetadata,
  },
  data: () => ({
    user: null,
    isFollower: false,
    isFollowerText: "FOLLOW",
    followersCount: 0,
    followingCount: 0,
    stories: [],
  }),
  mounted() {
    this.getAll()
  },
  watch: {
    $route: "getAll",
  },
  methods: {
    async getAll() {
      this.getUser();
      this.getUserStories();
      this.isFollowing();
    },
    async getUser() {
      try {
        const userId = this.$route.params.id;
        const response = await UserService.show(userId);
        this.user = response.data;
      } catch (err) {
        console.log(err);
      }
    },
    async getUserStories() {
      try {
        const response = await StoryService.user(this.$route.params.id);
        this.stories = response.data;
      } catch (err) {
        console.log(err);
      }
    },
    async isFollowing() {
      const followerId = this.$store.state.user.id;
      const followedId = this.$route.params.id;
      const response = await FollowService.findFollower(followerId, followedId);

      this.followersCount = response.data.followers.count;
      this.followingCount = response.data.following.count;

      if (response.data.isFollowing) {
        this.isFollower = true;
        this.isFollowerText = "UNFOLLOW";
      } else {
        this.isFollower = false;
        this.isFollowerText = "FOLLOW";
      }
    },
    // async getFollowers() {
    //   const response = await FollowService.getFollowers(this.$store.state.user.id)
    //   console.log(response)
    // },
    async addFollow() {
      try {
        const followerId = this.$store.state.user.id;
        const followedId = this.$route.params.id;
        const response = await FollowService.postFollow(followerId, followedId);
        if (response) {
          this.isFollower = true;
          this.isFollowerText = "UNFOLLOW";
          this.isFollowing()
        }
      } catch (err) {
        console.log(err);
      }
    },
    async deleteFollow() {
      try {
        const followerId = this.$store.state.user.id;
        const followedId = this.$route.params.id;
        const response = await FollowService.deleteFollow(
          followerId,
          followedId
        );
        if (response) {
          this.isFollower = false;
          this.isFollowerText = "FOLLOW";
          this.isFollowing();
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

<style scoped>
.about-title {
  font-size: 20px;
  font-weight: 600;
}
</style>