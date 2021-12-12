const express = require('express')
const router = express.Router();
const userCtrl = require('../controllers/user')
const validatorPassword = require("../middleware/validator-password")

router.post('/signup', validatorPassword, userCtrl.signup)
router.post('/login', userCtrl.login)

module.exports = router