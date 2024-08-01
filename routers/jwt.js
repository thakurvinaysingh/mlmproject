const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';


function verifyToken(req, res, next) {

    let token = '';

    // Check the header for the token
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }


    if (!token) {
        token = req.query.token;
    }


    if (!token) {
        token = req.body.token;
    }


    if (!token) {
        return res.status(401).json({ msg: 'Unauthorized token' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(403).json({ msg: 'Token is not valid' });
        }
        // req.user = decoded; 
        req.user = {
            userId: decoded.userId, // Assuming your user model has a userId field
            name: decoded.name,
            isAdmin: decoded.isAdmin,
            email: decoded.email,
            phone: decoded.phone,
        };
        next();
    });
}

module.exports = verifyToken;

