const express = require('express');
const followController = require('../controllers/followController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// GET MY FOLLOWERS
// /api/v1/follows/myFollowers    GET
// GET MY FOLLOWINGS
// /api/v1/follows/myFollowings   GET
// TO FOLLOW USER
// /api/v1/follows/:followingId   POST
// TO UNFOLLLOW USER
// /api/v1/follows/:followingId   DELETE
// GET FOLLOWERS OF A USER
// /api/v1/users/:userId/follows/followers   GET
// GET FOLLOWINGS OF A USER
// /api/v1/users/:userId/follows/followings   GET

router.route('/myFollowers').get(authController.protect, followController.getMyFollowers);
router.route('/myFollowings').get(authController.protect, followController.getMyFollowings);
router
  .route('/:followingId')
  .post(authController.protect, followController.follow)
  .delete(authController.protect, followController.unFollow);
router.route('/followers').get(followController.getFollowers);
router.route('/followings').get(followController.getFollowings);
router
  .route('/getExpsOfMyFollowings')
  .get(authController.protect, followController.getExpsOfMyFollowings);
module.exports = router;
