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
    console.log('🔑 JWT Created for user:', user.username, 'with role:', user.role);
    return token;
};

// Middleware to protect routes (Ensure the user is authenticated)
export const protect = (req, res, next) => {
    const bearer = req.headers.authorization;
    console.log('🔍 PROTECT - Authorization header:', bearer);

    if (!bearer || !bearer.startsWith('Bearer ')) {
        console.log('❌ PROTECT - No valid bearer token');
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    const token = bearer.split(' ')[1];
    if (!token) {
        console.log('❌ PROTECT - No token extracted');
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
        return;
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        console.log('✅ PROTECT - User authenticated:', {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });
        console.log('✅ PROTECT - User role specifically:', user.role);
        next();
    } catch (e) {
        console.error('❌ PROTECT - JWT verification failed:', e.message);
        res.status(401).json({ message: 'Unauthorized: Token is not valid' });
    }
};

// Middleware to authorize based on roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        console.log('🔍 AUTHORIZE - Required roles:', roles);
        console.log('🔍 AUTHORIZE - Request user object:', req.user);
        console.log('🔍 AUTHORIZE - User role from req.user:', req.user?.role);
        console.log('🔍 AUTHORIZE - Type of user role:', typeof req.user?.role);
        console.log('🔍 AUTHORIZE - Role comparison check:', roles.includes(req.user?.role));
        
        if (!req.user) {
            console.log('❌ AUTHORIZE - No user object found on request');
            res.status(403).json({ message: 'Forbidden: No user' });
            return;
        }
        
        if (!req.user.role) {
            console.log('❌ AUTHORIZE - No role property on user object');
            res.status(403).json({ message: 'Forbidden: No role' });
            return;
        }
        
        if (!roles.includes(req.user.role)) {
            console.log('❌ AUTHORIZE - Role not authorized:');
            console.log('   - User role:', req.user.role);
            console.log('   - Required roles:', roles);
            console.log('   - Exact match check:', roles.map(r => `"${r}" === "${req.user.role}" = ${r === req.user.role}`));
            res.status(403).json({ message: 'Forbidden: Access denied' });
            return;
        }
        
        console.log('✅ AUTHORIZE - Access granted for role:', req.user.role);
        next();
    };
};