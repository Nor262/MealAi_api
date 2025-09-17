'use strict';

const express = require('express');
const { z } = require('zod');
const { db, persist } = require('../db');
const { computeBMR, computeTDEE, getCalorieRange } = require('../utils/nutrition');
const { encryptSensitive } = require('../utils/security');

const router = express.Router();

const profileSchema = z.object({
	age: z.number().int().min(10).max(100),
	gender: z.enum(['male', 'female']),
	weight: z.number().min(20).max(300), // kg
	height: z.number().min(100).max(230), // cm
	activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
	conditions: z.array(z.string()).optional(),
	allergies: z.array(z.string()).optional(),
	tastes: z.array(z.string()).optional(),
	goal: z.enum(['lose', 'maintain', 'gain']).optional()
});

// Lấy hồ sơ
router.get('/:userId', (req, res) => {
	const { userId } = req.params;
	const profile = db.profiles[userId];
	if (!profile) return res.status(404).json({ message: 'Not found' });
	return res.json(profile);
});

// Cập nhật hồ sơ + tính BMR/TDEE
router.post('/:userId', (req, res) => {
	const { userId } = req.params;
	const parsed = profileSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({ message: 'Invalid data', errors: parsed.error.issues });
	}
	const data = parsed.data;
	const bmr = computeBMR(data);
	const tdee = computeTDEE(bmr, data.activityLevel || 'moderate');
	const calorieRange = getCalorieRange(tdee, data.goal || 'maintain');
	const metrics = { bmr: Math.round(bmr), tdee, calorieRange };

	// Demo: mã hóa trường nhạy cảm
	const encryptedConditions = (data.conditions || []).map(encryptSensitive);
	const encryptedAllergies = (data.allergies || []).map(encryptSensitive);

	const saved = {
		...data,
		conditions: encryptedConditions,
		allergies: encryptedAllergies,
		metrics
	};
	db.profiles[userId] = saved;
	persist();
	return res.json(saved);
});

module.exports = router;


