'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db, persist } = require('../db');

const router = express.Router();

// Tạo kế hoạch bữa ăn đơn giản (demo)
router.post('/:userId', (req, res) => {
	const { userId } = req.params;
	const { scope, constraints } = req.body || {};
	// scope: day/week/month
	const days = scope === 'month' ? 30 : scope === 'week' ? 7 : 1;
	const plan = [];
	const recipes = db.recipes.filter(r => {
		if (constraints?.diet === 'vegetarian') return r.vegan;
		return true;
	});
	for (let i = 0; i < days; i++) {
		plan.push({
			id: uuidv4(),
			date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
			meals: {
				breakfast: [recipes[1] || recipes[0]].map(r => ({ id: r.id, name: r.name })),
				lunch: [recipes[0]].map(r => ({ id: r.id, name: r.name })),
				dinner: [recipes[2] || recipes[0]].map(r => ({ id: r.id, name: r.name }))
			},
			shoppingList: []
		});
	}
	if (!db.plans[userId]) db.plans[userId] = [];
	db.plans[userId] = plan;
	persist();

	// Xuất danh sách cần mua thêm (demo): lấy các nguyên liệu không có trong kho
	const pantryNames = new Set((db.ingredients[userId] || []).map(i => i.name.toLowerCase()));
	const needToBuy = new Set();
	for (const r of db.recipes) {
		for (const ing of r.ingredients) {
			if (!pantryNames.has(ing.name.toLowerCase())) needToBuy.add(ing.name);
		}
	}
	const shoppingList = Array.from(needToBuy);
	plan.forEach(p => (p.shoppingList = shoppingList));
	persist();
	return res.json({ scope, plan });
});

// Lấy kế hoạch hiện tại
router.get('/:userId', (req, res) => {
	const { userId } = req.params;
	return res.json(db.plans[userId] || []);
});

module.exports = router;


