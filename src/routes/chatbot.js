'use strict';

const express = require('express');
const { db } = require('../db');
const { chatbotAnswer } = require('../services/ai');

const router = express.Router();

// Chatbot tư vấn nhanh (demo rule-based)
router.post('/:userId', (req, res) => {
	const { userId } = req.params;
	const { question } = req.body || {};
	if (!question) return res.status(400).json({ message: 'question required' });
	if (!process.env.OPENAI_API_KEY) {
		return res.status(500).json({ message: 'OPENAI_API_KEY is required for chatbot' });
	}
	(async () => {
		try {
			const profile = db.profiles[userId] || null;
			const pantry = db.ingredients[userId] || [];
			const answer = await chatbotAnswer(question, { profile, pantryNames: pantry.map(i => i.name) });
			return res.json({ answer });
		} catch (e) {
			return res.status(500).json({ message: 'Chatbot AI error', error: String(e.message || e) });
		}
	})();
});

module.exports = router;


