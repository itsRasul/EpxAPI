const Follow = require('../models/followModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Exp = require('../models/expModel');
const APIFeature = require('../utils/APIFeature');

exports.follow = catchAsync(async (req, res, next) => {
  const { id: follower } = req.user;
  const { followingId: following } = req.params;
  // check if user ( following ) is exist
  const isFollowingExist = await User.findById(following);
  if (!isFollowingExist) {
    throw new AppError('user who you wanna follow is not exist!', 404);
  }
  // check if user don't follow himself
  if (isFollowingExist._id == req.user.id) {
    throw new AppError('you can not follow yourself!', 400);
  }
  const result = await Follow.create({ follower, following });

  if (!result) {
    throw new AppError("you can't follow the user, something went wrong!", 400);
  }

  res.status(201).json({
    status: 'success',
    message: 'you followed the user successfully!',
    data: {
      data: result,
    },
  });
});

exports.unFollow = catchAsync(async (req, res, next) => {
  const { id: follower } = req.user;
  const { followingId: following } = req.params;

  const result = await Follow.findOneAndDelete({ follower, following });

  if (!result) {
    throw new AppError('user is not exist, or is not followed by you!', 404);
  }

  res.status(204).json({
    status: 'success',
    message: 'user is unfollowed by you successfully!',
    data: {
      data: result,
    },
  });
});

exports.getMyFollowers = catchAsync(async (req, res, next) => {
  const { id: following } = req.user;
  const followers = await Follow.find({ following }).populate({
    path: 'follower',
    select: 'userName photo',
  });

  res.status(200).json({
    status: 'success',
    results: followers.length,
    message: 'your followers are recieved successfully!',
    data: {
      followers,
    },
  });
});

exports.getMyFollowings = catchAsync(async (req, res, next) => {
  const { id: follower } = req.user;

  const followings = await Follow.find({ follower }).populate({
    path: 'following',
    select: 'userName photo',
  });

  res.status(200).json({
    status: 'success',
    results: followings.length,
    message: 'your followings are recieved successfully!',
    data: {
      followings,
    },
  });
});

exports.getFollowers = catchAsync(async (req, res, next) => {
  const { userId: following } = req.params;

  if (!following) {
    throw new AppError(
      'please enter userId in this format => /api/v1/users/:userId/follows/followers'
    );
  }

  const followers = await Follow.find({ following });

  res.status(200).json({
    status: 'success',
    results: followers.length,
    message: 'followers of user are recieved successfully!!',
    data: {
      followers,
    },
  });
});

exports.getFollowings = catchAsync(async (req, res, next) => {
  const { userId: follower } = req.params;

  if (!follower) {
    throw new AppError(
      'please enter userId in this format => /api/v1/users/:userId/follows/followings',
      404
    );
  }

  const followings = await Follow.find({ follower });

  res.status(200).json({
    status: 'success',
    results: followings.length,
    message: 'followings of user are recieved successfully!',
    data: {
      followings,
    },
  });
});

exports.getExpsOfMyFollowings = catchAsync(async (req, res, next) => {
  // 1) find my followings
  // 2) find exps which their user field is in my followings
  const { id: follower } = req.user;
  const results = await Follow.find({ follower });

  const followings = results.map(el => el.following);

  const feature = new APIFeature(Exp.find({ user: { $in: followings } }), req.query)
    .filter()
    .sort()
    .paginate()
    .limit()
    .fields();

  const exps = await feature.query;

  res.status(200).json({
    status: 'success',
    results: exps.length,
    message: 'experiences are recieved successfully!',
    data: {
      exps,
    },
  });
});
