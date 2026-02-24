const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { requireRoles } = require('../middlewares/roleCheck');
const userController = require('../controllers/userController');

router.post('/', auth, requireRoles('MANAGER'), userController.createUserValidation, userController.createUser);
router.get('/', auth, requireRoles('MANAGER'), userController.getUsers);

module.exports = router;
