const db = require('../config/db');

exports.addDoctor = (req, res) => {
    const { first_name, last_name, specialization, email, phone, schedule } = req.body;
    db.query('INSERT INTO Doctors SET ?', { first_name, last_name, specialization, email, phone, schedule: JSON.stringify(schedule) }, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Doctor added successfully!' });
    });
};

exports.getDoctors = (req, res) => {
    db.query('SELECT * FROM Doctors', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

exports.updateDoctor = (req, res) => {
    const { id, first_name, last_name, specialization, email, phone, schedule } = req.body;
    db.query('UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, email = ?, phone = ?, schedule = ? WHERE id = ?', [first_name, last_name, specialization, email, phone, JSON.stringify(schedule), id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Doctor updated successfully!' });
    });
};

exports.deleteDoctor = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Doctors WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Doctor deleted successfully!' });
    });
};
