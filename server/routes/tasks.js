import express from 'express';
import Task from '../models/Task.js';
import auth from '../middleware/auth.js';
import redis from 'redis';

const router = express.Router();
const redisClient = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.connect().catch((err) => {
    console.error('Redis connection failed:', err.message);
});

// Get all tasks for user
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create task
router.post('/', auth, async (req, res) => {
    const { title, input, operation } = req.body;
    try {
        const task = new Task({ title, input, operation, userId: req.user, status: 'pending' });
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Run task
router.post('/:id/run', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.status === 'running') {
            return res.status(400).json({ message: 'Task already running' });
        }
        task.status = 'pending';
        task.result = '';
        task.logs = '';
        await task.save();
        await redisClient.lPush('task_queue', JSON.stringify({ taskId: task._id.toString() }));
        res.json({ message: 'Task queued for processing' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update task
router.put('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user },
            req.body,
            { new: true }
        );
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;