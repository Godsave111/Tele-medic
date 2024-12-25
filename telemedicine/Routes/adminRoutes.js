const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');

router.post('/', adminController.addAdmin); // Admin only
router.get('/', adminController.getAdmins); // Admin only

module.exports = router;
