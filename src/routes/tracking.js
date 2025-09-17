'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db, persist } = require('../db');

const router = express.Router();

// Ghi nhận bữa ăn
router.post('/:userId/log', (req, res) => {
	const { userId } = req.params;
	const { name, recipeId, portion = 1, calories = 0, macros = { protein: 0, carb: 0, fat: 0 } } = req.body || {};
	if (!name && !recipeId) return res.status(400).json({ message: 'name hoặc recipeId required' });
	const entry = { id: uuidv4(), name, recipeId, portion, calories, macros, loggedAt: new Date().toISOString() };
	if (!db.meals[userId]) db.meals[userId] = [];
	db.meals[userId].push(entry);
	persist();
	return res.status(201).json(entry);
});

// Tiến độ so với mục tiêu
router.get('/:userId/progress', (req, res) => {
	const { userId } = req.params;
	const today = new Date().toISOString().slice(0, 10);
	const meals = (db.meals[userId] || []).filter(m => (m.loggedAt || '').slice(0, 10) === today);
	const totalCal = meals.reduce((s, m) => s + (Number(m.calories) || 0), 0);
	const profile = db.profiles[userId];
	const target = profile?.metrics?.calorieRange || { min: 0, max: 0 };
	let status = 'within';
	if (totalCal < target.min) status = 'below';
	if (totalCal > target.max) status = 'above';
	return res.json({ date: today, totalCal, target, status });
});

// Báo cáo tuần
router.get('/:userId/weekly-report', (req, res) => {
	const { userId } = req.params;
	const now = new Date();
	const days = [...Array(7)].map((_, i) => new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10)).reverse();
	const profile = db.profiles[userId];
	const target = profile?.metrics?.calorieRange || { min: 0, max: 0 };
	const series = days.map(d => {
		const dailyMeals = (db.meals[userId] || []).filter(m => (m.loggedAt || '').slice(0, 10) === d);
		const total = dailyMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0);
		return { date: d, total };
	});
	return res.json({ target, series });
});

module.exports = router;


