<template>
  <v-hover v-slot:default="{ hover }">
    <v-card
      :to="{ path: `/stories/${story.id}` }"
      raised
      :elevation="hover ? 8 : 2"
      class="my-6"
    >
      <v-row class="px-5 pt-2">
        <v-col class="col-12 d-flex align-center">
          <div style="width: 100%; height: 100%">
            <div>
              <v-list-item class="pb-4 pl-0 ml-0">
                <router-link
                  v-if="story.Users[0]"
                  :to="{
                    path: `/users/${story.Users[0].display_name.toLowerCase()
              .replace(/\s/g, '')}/${
                      story.Users[0].id
                    }/profile`,
                  }"
                  style="z-index: 999"
                  class="pb-2"
                >
                  <v-list-item-avatar size="36px" color="grey darken-3">
                    <v-img
                      v-if="story.Users.length > 0 && story.Users[0].icon_url"
                      :src="story.Users[0].icon_url"
                    ></v-img>
                    <v-img
                      v-else
                      src="@/assets/blue-error-background.jpg"
                    ></v-img>
                  </v-list-item-avatar>
                </router-link>

                <div class="">
                  <router-link
                    v-if="story.Users[0]"
                    :to="{
                      path: `/users/${story.Users[0].display_name.toLowerCase()
              .replace(/\s/g, '')}/${
                        story.Users[0].id
                      }/profile`,
                    }"
                    style="z-index: 999"
                  >
                    <span class="font-weight-bold d-block">{{
                      story.Users[0].display_name
                    }}</span>
                  </router-link>

                  <div class="d-flex justify-space-between">
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          class="subtitle-2 mb-2 d-inline-block"
                          v-bind="attrs"
                          v-on="on"
                          >{{ story.createdAt | formatStoryDate }} ·
                          {{ readingTime }}
                          min read</span
                        >
                      </template>
                      <span
                        >Updated at
                        {{ story.updatedAt | formatStoryDate }}</span
                      >
                    </v-tooltip>
                  </div>
                  <!-- <v-icon class="mr-3">mdi-share-variant</v-icon> -->
                </div>
                <div class="d-flex align-center justify-center ml-5">
                  <v-btn
                    small
                    white
                    outlined
                    class="inline-block"
                    v-if="isOwner"
                    :to="{
                      name: 'story-edit',
                      params: { id: story.id },
                    }"
                  >
                    EDIT
                  </v-btn>
                </div>
                <v-spacer />
                <v-icon v-if="story.featured" size="25px">{{
                  "mdi-star"
                }}</v-icon>
              </v-list-item>
            </div>
            <v-img
              :src="
                imageError
                  ? require('@/assets/blue-error-background.jpg')
                  : story.thumbnail_url
              "
              class="darker-img px-4"
              @error="imageLoadError"
              height="200px"
            ></v-img>
            <span class="d-block display-1 font-weight-bold mt-5">
              {{ story.title }}
            </span>
            <span class="d-block title font-weight-bold grey--text my-1">
              {{ story.short_description | shortString }}
            </span>
            <div class="d-flex justify-space-between my-3">
              <span class="d-block">
                <router-link :to="$router.currentRoute">
                <v-icon :disabled="story.Users[0].id == $store.state.user.id" color="red" size="22px" @click="addLike(story.id)">{{
                  likeIcon
                }}</v-icon>
                <span class="mr-3" style="font-size: 14px;">
                  {{ likesCount }}
                </span>
              </router-link>
              </span>
              <span class="d-block">
                <router-link :to="$router.currentRoute">
                  <v-icon
                    size="24px"
                    style="z-index: 999"
                    @click="addBookmark(story.id)"
                    >{{ bookmarkIcon }}</v-icon
                  >
                </router-link>
              </span>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-hover>
</template>


<script>
import GeneralService from "@/services/GeneralService";
export default {
  data: () => ({
    isOwner: false,
    imageError: false,
    likesCount: 0,
    bookmarkIcon: "mdi-bookmark-outline",
    likeIcon: "mdi-heart-outline",
    readingTime: 0,

    // formatedDate: formatDate(this.story.createdAt)
  }),
  props: {
    story: Object,
  },
  mounted() {
    this.checkBookmark();
     this.checkLike();
    this.checkOwner();
    this.totalReadingTime(this.story.description);
  },
  methods: {
    async imageLoadError() {
      this.imageError = true;
    },
    async checkOwner() {
      if (this.$store.state.user) {
        if (this.story.Users[0]) {
          if (this.story.Users[0].id === this.$store.state.user.id) {
            this.isOwner = true;
          } else {
            this.isOwner = false;
          }
        }
      }
    },
    async checkBookmark() {
      const response = await GeneralService.getBookmarks(
        this.$store.state.user.id
      );
      response.data.bookmarks.map((bookmark) => {
        if (bookmark.story_id === this.story.id) {
          this.bookmarkIcon = "mdi-bookmark";
        }
      });
    },
    async addBookmark(storyId) {
      // If no bookmark, add a new bookmark
      if (this.bookmarkIcon === "mdi-bookmark-outline") {
        try {
          const response = await GeneralService.postBookmark(
            this.$store.state.user.id,
            storyId
          );
          if (response) {
            this.bookmarkIcon = "mdi-bookmark";
          }
        } catch (err) {
          console.log(err);
        }
        // If bookmark, remove bookmark
      } else {
        try {
          const response = await GeneralService.deleteBookmark(
            this.$store.state.user.id,
            storyId
          );
          if (response) {
            this.bookmarkIcon = "mdi-bookmark-outline";
          }
        } catch (err) {
          console.log(err);
        }
      }
    },
    async checkLike() {
      const response = await GeneralService.getLikes(
        this.$store.state.user.id,
        this.story.id
      );
      this.likesCount = response.data.likesCount.count;
      response.data.likes.map((like) => {
        if (like.story_id === this.story.id) {
          this.likeIcon = "mdi-heart";
        } else {
          this.likeIcon = "mdi-heart-outline";
        }
      });
    },
    async addLike(storyId) {
      // If no like, add new like
      if (this.likeIcon === "mdi-heart-outline") {
        try {
          const response = await GeneralService.postLike(
            this.$store.state.user.id,
            storyId
          );
          if (response) {
            this.likeIcon = "mdi-heart";
            this.likesCount++;
          }
        } catch (err) {
          console.log(err);
        }
        // If like, remove bookmark
      } else {
        try {
          const response = await GeneralService.deleteLike(
            this.$store.state.user.id,
            storyId
          );
          if (response) {
            this.likeIcon = "mdi-heart-outline";
            this.likesCount--;
          }
        } catch (err) {
          console.log(err);
        }
      }
    },
    totalReadingTime(content) {
      const time = content.split(" ").length / 200;
      if (time < 1) {
        this.readingTime = 1;
      } else {
        this.readingTime = Math.round(time);
      }
    },
  },
};
</script>

<style>
</style>