const express = require('express');

const User = require('../models/user');

const router = new express.Router();

// POST User login
router.post('/signIn', async (req, res) => {
    try {
        // Find user using email and password
        const user = await User.findByCredentials(req.body.email, req.body.password);
        // Generate auth token
        const token = await user.generateAuthToken();
        // Put JWT in cookie
        res.cookie('auth_token', token);
        res.set({ 'Authorization': token })
        return res.sendStatus(200);
    } catch (e) {
        return res.sendStatus(400);
    }
})

// POST Create users
router.post('/signup', async (req, res) => {
    try {
        // Create user from req.body
        const user = new User(req.body);
        // Generate token for user
        const token = await user.generateAuthToken();
        // Save user
        await user.save();
        // Put JWT in cookie
        res.cookie('auth_token', token);
        res.set({ 'Authorization': token })
        return res.sendStatus(200);
    } catch (e) {
        console.log(e.message)
        return res.status(400).send({ message: e.message });
    }
})

module.exports = router;