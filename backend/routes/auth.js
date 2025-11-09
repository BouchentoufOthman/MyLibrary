import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Registration route
router.post('/register', async (req, res) => {
    console.log('=== REGISTRATION REQUEST RECEIVED ===');
    console.log('Request body:', req.body);
    
    const { username, email, password, role } = req.body;
    try {
        console.log('Checking fields...');
        if (!username || !email || !password) {
            console.log('Missing fields!');
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Validate role if provided
        if (role && !['student', 'admin', 'guest'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be student, admin, or guest' });
        }

        console.log('Checking if user exists...');
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('User already exists!');
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('Creating new user...');
        const user = await User.create({ 
            username, 
            email, 
            password,
            role: role || 'student'
        });
        console.log('User created successfully:', user._id);
        
        console.log('Generating token...');
        const token = generateToken(user._id);
        console.log('Token generated successfully');
        
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token,
        });
        console.log('Registration successful!');
    } catch (error) {
        console.error('=== REGISTRATION ERROR ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
});

// Login route - ADD/REPLACE THIS ONE
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = generateToken(user._id);
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role, // Include role in response
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user route
router.get('/me', protect, async (req, res) => {
    res.status(200).json(req.user);
});

// Get all guest users (Admin only)
router.get('/guests', protect, async (req, res) => {
    try {
        const guests = await User.find({ role: 'guest' }).select('-password');
        res.json(guests);
    } catch (error) {
        console.error('Error fetching guest users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}

export default router;