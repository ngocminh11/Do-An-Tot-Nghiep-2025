const express = require('express');
const router = express.Router();
const userController = require('../Controllers/account.controller');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/', userController.deleteUser);

module.exports = router;