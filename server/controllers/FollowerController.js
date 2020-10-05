const {
    User,
    Follower
} = require('../models')

const {
    Op, QueryTypes
} = require('sequelize')

const sequelize = require('sequelize')

module.exports = {
    async findFollower(req, res) {
        try {
            const followerId = req.body.followerId;
            const followedId = req.body.followedId;

            const isFollowing = await Follower.findOne({
                where: {
                    follower_id: followerId,
                    followed_id: followedId
                }
            })


            let followers = await Follower.findAndCountAll({
                where: {
                    follower_id: followerId
                },
                include: [{
                    model: User
                }],
                
            });
            let following = await Follower.findAndCountAll({
                where: {
                    follower_id: followerId,
                },
            })

            if (isFollowing) {
                res.send({
                    isFollowing: true,
                    followers: followers,
                    following: following
                })
            } else {
                res.send({
                    followers: followers,
                    following: following
                })
            }

        } catch (error) {
            res.status(500).send({
                error: 'an error has occured trying to fetch the followers'
            })
        }
    },
    async getFollowers(req, res) {
        try {
            const userId = req.params.followerId
            const followers = await sequelize.query("SELECT * FROM `Users`", {
                type: QueryTypes.SELECT
            });
            // const user = await User.findOne({
            //     where: {
            //         id: userId
            //     }
            // })
            // const followers = await Follower.findAll({
            //     where: {
            //         follower_id: userId
            //     },
                
            //         include: [{model: U}]
             
            // })
            console.log(followers)
            res.send({
                followers
            })
        } catch (err) {
            res.status(500).send({
                error: 'an error has occured trying to fetch the followers'
            })
        }
    },

    async postFollow(req, res) {
        try {
            const followerId = req.body.followerId
            const followedId = req.body.followedId
            console.log(followerId, followedId)
            const follower = await Follower.create({
                follower_id: followerId,
                followed_id: followedId
            })
            res.send(follower)
        } catch (err) {
            console.log(err)
            res.status(500).send({
                error: 'an error has occured trying to create the follower object'
            })
        }
    },

    async deleteFollow(req, res) {
        try {
            const followerId = req.params.followerId
            const followedId = req.params.followedId
            console.log(followerId, followedId)
            const follow = await Follower.destroy({
                where: {
                    follower_id: followerId,
                    followed_id: followedId
                }
            })
            res.send("Follower removed")
        } catch (err) {
            console.log(err)
            res.status(500).send({
                error: 'an error has occured trying to create the bookmark object'
            })
        }
    },

}