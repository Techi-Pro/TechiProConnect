import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
}

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
}

// Generate JWT for user
export const createJWT = (user: any): string => {
    const token = jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: '1d',
        }
    );
    console.log('🔑 JWT Created for user:', user.username, 'with role:', user.role);
    return token;
};

// Middleware to protect routes (Ensure the user is authenticated)
export const protect = (req: Request, res: Response, next: NextFunction): void => {
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
        const user = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = user;
        console.log('✅ PROTECT - User authenticated:', {
            id: (user as any).id,
            username: (user as any).username,
            email: (user as any).email,
            role: (user as any).role
        });
        console.log('✅ PROTECT - User role specifically:', (user as any).role);
        next();
    } catch (e: any) {
        console.error('❌ PROTECT - JWT verification failed:', e.message);
        res.status(401).json({ message: 'Unauthorized: Token is not valid' });
    }
};

// Middleware to authorize based on roles
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
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