exports.isAuthenticated = (req, res, next) => {
    if (req.session.patientId) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};
