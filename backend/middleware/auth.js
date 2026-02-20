const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('Authorization');

    // Check if not token
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    // Expecting "Bearer TOKEN_STRING", so split and take the second part
    const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    // Verify token
    try {
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        req.user = decoded.user; // Attach user payload (containing user ID) to the request object
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};