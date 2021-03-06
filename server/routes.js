const AuthenticationController = require('./controllers/AuthenticationController')
const StoriesController = require('./controllers/StoriesController')
const CategoriesController = require('./controllers/CategoriesController')
const RolesController = require('./controllers/RolesController')
const UsersController = require('./controllers/UsersController')
const GeneralController = require('./controllers/GeneralController')
const FollowerController = require('./controllers/FollowerController');

// const authJwt = require('./middleware/authJwt')
const passport = require('passport')

const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')
const UserControllerPolicy = require('./policies/UserControllerPolicy')
const StoryControllerPolicy = require('./policies/StoryControllerPolicy')

const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error("Incorrect file");
        error.code = "INCORRECT_FILETYPE";
        return cb(error, false)
    }
    cb(null, true);
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2
    },
    fileFilter: fileFilter
}).single('file');

module.exports = (app) => {

    // LOGIN, REGISTER ROUTES
    app.post('/api/register', AuthenticationControllerPolicy.register, AuthenticationController.register)
    app.post('/api/login', AuthenticationController.login)
    app.post('/api/auth/facebook', AuthenticationController.facebookAuth)

    app.post('/api/auth/google',
        AuthenticationController.googleAuth);

    //USER ROUTES
    app.get('/api/users', UsersController.index)
    app.get('/api/users/admin', UsersController.allUserInfo)
    app.get('/api/users/:userId', UsersController.show)
    app.post('/api/users/:userId/upload', upload, UsersController.uploadFile)
    app.get('/api/upload/:image_name', UsersController.retrieveFile)

    app.use((err, req, res, next) => {
        if (err.code === "INCORRECT_FILETYPE") {
            res.status(422).json({
                error: 'Only images are allowed'
            });
            return;
        }
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(422).json({
                error: 'File size should be less than 2 MB!'
            });
            return;
        }
    });

    app.put('/api/users/:userId', UserControllerPolicy.update, UsersController.put)
    app.delete('/api/users/:userId', UsersController.delete)

    // STORY ROUTES
    app.get('/api/stories', StoriesController.index)
    app.get('/api/stories/:storyId', StoriesController.show)
    app.get('/api/stories/users/:userId', StoriesController.user)
    app.get('/api/stories/categories/:categoryId', StoriesController.showCategories)
    app.get('/api/stories/categories/similar/:categoryId/:storyId', StoriesController.showSimilar)
    app.get('/api/stories/categories/other/:categoryId/:storyId', StoriesController.showDifferent)

    app.put('/api/stories/:storyId', StoryControllerPolicy.update, StoriesController.put)
    app.post('/api/stories/:userId', StoryControllerPolicy.update, StoriesController.post)
    app.post('/api/stories/:storyid/upload', upload, StoriesController.imageUpload)
    app.delete('/api/stories/:storyId', StoriesController.delete)

    // CATEGORY ROUTES
    app.get('/api/categories', CategoriesController.index)
    app.post('/api/categories', CategoriesController.create)
    app.put('/api/categories', CategoriesController.update)
    app.delete('/api/categories', CategoriesController.delete)

    // ROLE ROUTES
    app.get('/api/roles', RolesController.index)
    app.post('/api/roles', RolesController.create)
    app.put('/api/roles', RolesController.update)
    app.delete('/api/roles', RolesController.delete)

    // GENERAL ROUTES

    app.get('/api/admin/general/count', GeneralController.count)
    app.get('/api/history/:userId', GeneralController.findHistory) //TRACK USER HISTORY
    app.post('/api/history/:storyId/:userId', GeneralController.postHistory)
    app.get('/api/bookmarks/:userId', GeneralController.getBookmarks)
    app.post('/api/bookmarks/:storyId/:userId', GeneralController.postBookmark)
    app.delete('/api/bookmarks/:storyId/:userId', GeneralController.deleteBookmark),
        app.post('/api/search', GeneralController.search)

    app.get('/api/likes/:storyId/:userId', GeneralController.getLikes)
    app.post('/api/likes/:storyId/:userId', GeneralController.postLike)
    app.delete('/api/likes/:storyId/:userId', GeneralController.deleteLike),

        // FOLLOW ROUTE

    app.post('/api/followers/single', FollowerController.findFollower)
    app.get('/api/followers/:followerId', FollowerController.getFollowers)
    app.post('/api/followers', FollowerController.postFollow)
    app.delete('/api/followers/:followerId/:followedId', FollowerController.deleteFollow)

    //FILE UPLOAD ROUTE
    // app.post('/upload', upload.single('file'), (req, res) => {
    //     res.json({file: req.file})
    //     console.log(req.file)
    //     console.log(req.body)
    // })
}