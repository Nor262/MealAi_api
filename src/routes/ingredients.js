'use strict';

const express = require('express');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const { db, persist } = require('../db');
const { classifyIngredient } = require('../services/ai');

const router = express.Router();

const manualSchema = z.object({
	name: z.string().min(1),
	quantity: z.number().min(0.01),
	unit: z.string().min(1).default('unit'),
	expiryDate: z.string().datetime().optional()
});

// Liệt kê nguyên liệu
router.get('/:userId', (req, res) => {
	const { userId } = req.params;
	return res.json(db.ingredients[userId] || []);
});

// Thêm thủ công
router.post('/:userId/manual', (req, res) => {
	const { userId } = req.params;
	const parsed = manualSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ message: 'Invalid', errors: parsed.error.issues });
	const item = { id: uuidv4(), ...parsed.data };
	if (!db.ingredients[userId]) db.ingredients[userId] = [];
	db.ingredients[userId].push(item);
	persist();
	return res.status(201).json(item);
});

// Quét mã vạch (demo gọi API giả)
router.post('/:userId/barcode', (req, res) => {
	const { userId } = req.params;
	const { barcode } = req.body || {};
	if (!barcode) return res.status(400).json({ message: 'barcode required' });
	const product = { // giả lập từ barcode
		name: 'Sữa hạnh nhân không đường',
		quantity: 1,
		unit: 'hộp',
		barcode,
		expiryDate: new Date(Date.now() + 7 * 86400000).toISOString()
	};
	const item = { id: uuidv4(), ...product };
	if (!db.ingredients[userId]) db.ingredients[userId] = [];
	db.ingredients[userId].push(item);
	persist();
	return res.status(201).json(item);
});

// Upload ảnh nguyên liệu -> AI CV phân loại (demo)
router.post('/:userId/image', (req, res) => {
	const { userId } = req.params;
	const { imageUrl } = req.body || {};
	if (!imageUrl) return res.status(400).json({ message: 'imageUrl required' });
	(async () => {
		try {
			const guess = await classifyIngredient(imageUrl);
			const item = {
				id: uuidv4(),
				name: guess || 'Nguyên liệu',
				quantity: 1,
				unit: 'phần',
				imageUrl,
				expiryDate: new Date(Date.now() + 3 * 86400000).toISOString()
			};
			if (!db.ingredients[userId]) db.ingredients[userId] = [];
			db.ingredients[userId].push(item);
			persist();
			return res.status(201).json(item);
		} catch (e) {
			return res.status(500).json({ message: 'AI classify failed', error: String(e.message || e) });
		}
	})();
});

// Cảnh báo sắp hết hạn (trả về)
router.get('/:userId/expiring', (req, res) => {
	const { userId } = req.params;
	const today = new Date();
	const items = (db.ingredients[userId] || []).filter((it) => {
		if (!it.expiryDate) return false;
		const diff = Math.ceil((new Date(it.expiryDate) - today) / 86400000);
		return diff <= 2;
	});
	return res.json(items);
});

module.exports = router;


