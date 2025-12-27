const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');



const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);


router.post('/forgotPassword', authController.forgotPassword);

router.patch('/resetPassword/:token', authController.resetPassword);



router.use(authController.protect);

router.patch('/updatePassword',authController.updatePassword);
router.patch('/updateMe',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);
router.delete('/deleteMe',userController.deleteMe);

router.get('/me',  userController.getMe,userController.getUsersById);



router.use(authController.restrictTo('admin'));
 router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createNewUser);

    router.route('/:id')
    .get(userController.getUsersById)
    .patch(userController.updateUsers)
    .delete(authController.protect, userController.deleteUsers);
    module.exports = router;