const User = require('../models/User');
const { body, validationResult } = require('express-validator');

exports.createUserValidation = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['MANAGER', 'SUPPORT', 'USER'])
];

exports.createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    const user = new User(req.body);
    await user.save();
    const u = user.toObject();
    delete u.password;
    res.status(201).json(u);
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
};
