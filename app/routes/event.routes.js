const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authJwt');
const Event = require('../models/event.model');

// Fetch events for the logged-in user
router.get('/events', verifyToken, async (req, res) => {
    try {
        const userId = req.userId; // Get the user ID from the token
        const events = await Event.find({ user: userId });

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
    }
});

module.exports = router;
