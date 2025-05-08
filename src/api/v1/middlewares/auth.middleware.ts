import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
}

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

// Generate JWT for user
export const createJWT = (user) => {
    const token = jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1d',
        }
    );
    return token;
};

// Middleware to protect routes (Ensure the user is authenticated)
export const protect = (req, res, next) => {
    const bearer = req.headers.authorization;
    console.log('Authorization header:', bearer);  // Debugging step

    if (!bearer || !bearer.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    const token = bearer.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
        return;
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        console.log('User authenticated:', user);  // Debugging step
        next();
    } catch (e) {
        console.error(e);
        res.status(401).json({ message: 'Unauthorized: Token is not valid' });
    }
};


// Middleware to authorize based on roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden: Access denied' });
            return;
        }
        next();
    };
};
