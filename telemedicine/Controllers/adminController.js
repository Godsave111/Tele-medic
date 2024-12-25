const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.addAdmin = async (req, res) => {
    const { username, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    db.query('INSERT INTO Admin SET ?', { username, password_hash, role: 'admin' }, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Admin added successfully!' });
    });
};

exports.getAdmins = (req, res) => {
    db.query('SELECT * FROM Admin', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};
