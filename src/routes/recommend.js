'use strict';

const express = require('express');
const { db } = require('../db');
const { recommendMeals } = require('../services/ai');

const router = express.Router();

// Đề xuất món ăn
router.post('/:userId', (req, res) => {
	const { userId } = req.params;
	const { priorities } = req.body || {};
	const profile = db.profiles[userId];
	const pantry = db.ingredients[userId] || [];
	const now = new Date();

	let candidates = [...db.recipes];
	// lọc nhanh theo ưu tiên
	if (priorities?.vegan === true) candidates = candidates.filter(r => r.vegan);
	if (priorities?.proteinRich === true) candidates = candidates.filter(r => r.proteinRich);
	if (typeof priorities?.maxTime === 'number') candidates = candidates.filter(r => r.timeMinutes <= priorities.maxTime);
	if (typeof priorities?.maxPriceLevel === 'number') candidates = candidates.filter(r => r.priceLevel <= priorities.maxPriceLevel);

	// Ưu tiên dùng nguyên liệu sắp hết hạn
	const expiringNames = new Set((pantry || []).filter(it => it.expiryDate && (new Date(it.expiryDate) - now) / 86400000 <= 2).map(it => it.name.toLowerCase()));
	const scored = candidates.map(r => {
		const names = r.ingredients.map(i => i.name.toLowerCase());
		const hasExpiring = names.some(n => expiringNames.has(n));
		const score = (hasExpiring ? 10 : 0) + (priorities?.proteinRich && r.proteinRich ? 3 : 0) + (priorities?.vegan && r.vegan ? 2 : 0);
		return { recipe: r, score };
	}).sort((a, b) => b.score - a.score);

	const top = scored.slice(0, 5).map(s => s.recipe);

	// Nếu có API key -> gọi AI để lấy gợi ý phong phú hơn, fallback sang top
	(async () => {
		try {
			const ai = await recommendMeals({ profile, pantry, context: { priorities } });
			if (Array.isArray(ai.items) && ai.items.length) {
				return res.json({ recommendations: ai.items });
			}
			return res.json({ recommendations: top });
		} catch (_) {
			return res.json({ recommendations: top });
		}
	})();
});

// Gợi ý thay thế nguyên liệu thiếu
router.post('/:userId/substitute', (req, res) => {
	const { userId } = req.params;
	const { recipeId } = req.body || {};
	const recipe = db.recipes.find(r => r.id === recipeId);
	if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

	const substitutions = {
		'ức gà': ['Ức gà', 'Cá phi lê', 'Đậu hũ (cho chay)'],
		'gà': ['Cá', 'Thịt nạc heo', 'Đậu hũ'],
		'sữa bò': ['Sữa hạnh nhân', 'Sữa yến mạch'],
		'dầu olive': ['Dầu bơ', 'Dầu hạt cải']
	};

	const suggestions = recipe.ingredients.map(ing => {
		const key = ing.name.toLowerCase();
		const sub = substitutions[key] || [];
		return { ingredient: ing.name, substitutes: sub };
	});

	return res.json({ recipeId, suggestions });
});

module.exports = router;


