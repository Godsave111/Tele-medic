const db = require('../config/db');

exports.bookAppointment = (req, res) => {
    const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;
    db.query('INSERT INTO Appointments SET ?', { patient_id, doctor_id, appointment_date, appointment_time, status: 'scheduled' }, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Appointment booked successfully!' });
    });
};

exports.getAppointments = (req, res) => {
    const patientId = req.session.patientId;
    db.query('SELECT * FROM Appointments WHERE patient_id = ?', [patientId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

exports.updateAppointment = (req, res) => {
    const { id, appointment_date, appointment_time } = req.body;
    db.query('UPDATE Appointments SET appointment_date = ?, appointment_time = ? WHERE id = ?', [appointment_date, appointment_time, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Appointment updated successfully!' });
    });
};

exports.cancelAppointment = (req, res) => {
    const { id } = req.params;
    db.query('UPDATE Appointments SET status = "canceled" WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Appointment canceled successfully!' });
    });
};
