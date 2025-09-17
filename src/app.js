'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const { db, persist } = require('./db');
const { computeBMR, computeTDEE, getCalorieRange } = require('./utils/nutrition');
const { encryptSensitive, decryptSensitive } = require('./utils/security');

const profileRouter = require('./routes/profile');
const ingredientsRouter = require('./routes/ingredients');
const recommendRouter = require('./routes/recommend');
const plannerRouter = require('./routes/planner');
const trackingRouter = require('./routes/tracking');
const feedbackRouter = require('./routes/feedback');
const chatbotRouter = require('./routes/chatbot');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Mount routers
app.use('/api/profile', profileRouter);
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api/planner', plannerRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/chatbot', chatbotRouter);

// Cron: cảnh báo nguyên liệu sắp hết hạn mỗi ngày 08:00
cron.schedule('0 8 * * *', () => {
	const today = new Date();
	const notifications = [];
	for (const userId of Object.keys(db.ingredients)) {
		const items = db.ingredients[userId] || [];
		items.forEach((item) => {
			if (!item.expiryDate) return;
			const expiry = new Date(item.expiryDate);
			const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
			if (diffDays <= 2) {
				notifications.push({ userId, itemName: item.name, daysLeft: diffDays });
			}
		});
	}
	db.notifications.push(...notifications);
	persist();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

module.exports = app;


