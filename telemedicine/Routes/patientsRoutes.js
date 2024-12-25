const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/auth').isAuthenticated;
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const patientController = require('../controllers/patientController');
const db = require('../config/db');

// Registration with Validation
router.post('/register', [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').normalizeEmail().isEmail().withMessage('Email must be valid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().isNumeric().withMessage('Phone number is required and must be numeric'),
    body('date_of_birth').isDate().withMessage('Date of birth must be a valid date'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    body('address').notEmpty().withMessage('Address is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, password, phone, date_of_birth, gender, address } = req.body;

    try {
        // Hash the password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert patient into the database
        await db.execute('INSERT INTO Patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [first_name, last_name, email, password_hash, phone, date_of_birth, gender, address]);

        res.status(201).json({ message: 'Patient registered successfully' });
    } catch (error) {
        console.error(error);  // Log the error for debugging purposes
        res.status(500).json({ error: 'An error occurred while registering the patient' });
    }
});

// Other patient routes (login, profile, etc.)
router.post('/login', patientController.login);
router.get('/profile', isAuthenticated, patientController.viewProfile);
router.put('/profile', isAuthenticated, patientController.updateProfile);
router.post('/logout', patientController.logout);

module.exports = router;
