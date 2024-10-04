const express = require('express');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require('./../controllers/userController');

const {
  protect,
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassord,
} = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', login);
router.get('/logout', logout);
router.post('/forgotPassowrd', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect); // all the routes below are now protected
router.patch('/updatePassword', updatePassord);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

router.route('/').get(getAllUsers).post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
