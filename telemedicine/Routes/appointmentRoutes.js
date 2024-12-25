const express = require('express');
const router = express.Router();
const appointmentController = require('./controllers/appointmentController');
const isAuthenticated = require('../middleware/auth').isAuthenticated;

router.post('/', isAuthenticated, appointmentController.bookAppointment);
router.get('/', isAuthenticated, appointmentController.getAppointments);
router.put('/', isAuthenticated, appointmentController.updateAppointment);
router.delete('/:id', isAuthenticated, appointmentController.cancelAppointment);

module.exports = router;
