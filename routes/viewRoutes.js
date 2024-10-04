const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get(
  '/',
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get(
  '/me',
  authController.protect,
  viewsController.getUserAccount
);
router.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewsController.getTour
);
router.get(
  '/login',
  authController.isLoggedIn,
  viewsController.login
);

module.exports = router;
