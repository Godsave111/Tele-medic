const bcrypt = require ('bcryptjs');
const db = require('../config/db');  





// Registration
exports.register = async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone, date_of_birth, gender, address } = req.body;

        // Hash the password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert the new patient into the database
        db.query('INSERT INTO Patients SET ?', 
            { first_name, last_name, email, password_hash, phone, date_of_birth, gender, address }, 
            (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: 'Patient registered successfully!' });
            }
        );
    } catch (err) {
        return res.status(500).json({ error: 'An error occurred during registration' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch patient from the database
        db.query('SELECT * FROM Patients WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // If no patient found with that email
            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const patient = results[0];
            const isMatch = await bcrypt.compare(password, patient.password_hash);

            // If password doesn't match
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Start session by storing patient ID
            req.session.patientId = patient.id;
            res.status(200).json({ message: 'Login successful' });
        });
    } catch (err) {
        return res.status(500).json({ error: 'An error occurred during login' });
    }
};

// View Profile
exports.viewProfile = (req, res) => {
    const patientId = req.session.patientId;

    // Check if the user is authenticated
    if (!patientId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Query to get the patient profile details
    db.query('SELECT first_name, last_name, phone, date_of_birth, gender, address FROM Patients WHERE id = ?', [patientId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Patient not found' });

        res.status(200).json(results[0]);
    });
};

// Update Profile
exports.updateProfile = async (req, res) => {
    const patientId = req.session.patientId;
    const { first_name, last_name, phone, date_of_birth, gender, address } = req.body;

    // Check if the user is authenticated
    if (!patientId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Query to update the patient profile
    db.query('UPDATE Patients SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? WHERE id = ?', 
        [first_name, last_name, phone, date_of_birth, gender, address, patientId], 
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Patient not found' });

            res.status(200).json({ message: 'Profile updated successfully!' });
        }
    );
};

// Logout
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Logged out successfully' });
    });
};
