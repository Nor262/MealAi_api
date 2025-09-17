'use strict';

const express = require('express');
const { db, persist } = require('../db');

const router = express.Router();

// Đánh giá món ăn
router.post('/:userId/rate', (req, res) => {
	const { userId } = req.params;
	const { recipeId, stars = 5, comment = '', difficulty = 'easy' } = req.body || {};
	if (!recipeId) return res.status(400).json({ message: 'recipeId required' });
	if (!db.feedbacks[userId]) db.feedbacks[userId] = [];
	db.feedbacks[userId].push({ recipeId, stars, comment, difficulty, at: new Date().toISOString() });
	persist();
	return res.json({ ok: true });
});

// Lấy đánh giá
router.get('/:userId', (req, res) => {
	const { userId } = req.params;
	return res.json(db.feedbacks[userId] || []);
});

module.exports = router;


