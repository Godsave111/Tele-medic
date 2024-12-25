const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.post('/', doctorController.addDoctor); // Admin only
router.get('/', doctorController.getDoctors); // Admin only
router.put('/', doctorController.updateDoctor); // Admin only
router.delete('/:id', doctorController.deleteDoctor); // Admin only

module.exports = router;
