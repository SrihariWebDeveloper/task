import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    console.log('Register endpoint hit');
    console.log('Request body:', req.body);
    const { username, email, password } = req.body;
    console.log('Registering user:', email);
    if (!username || !email || !password) {
        console.log('Validation failed:', { username, email, password });
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set in environment');
        return res.status(500).json({ message: 'Server configuration error' });
    }
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        user = new User({ username, email, password });
        await user.save();
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment');
            return res.status(500).json({ message: 'Server configuration error' });
        }
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;