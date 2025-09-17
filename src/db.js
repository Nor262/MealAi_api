'use strict';

const { loadData, saveData } = require('./storage/fileStorage');

// DB in-memory + persisted JSON đơn giản cho demo
const db = loadData() || {
	profiles: {}, // userId -> { age, gender, weight, height, conditions, allergies, tastes, goal, metrics }
	ingredients: {}, // userId -> [ { id, name, quantity, unit, barcode, imageUrl, expiryDate } ]
	recipes: [], // demo recipes
	plans: {}, // userId -> [ { id, date, meals: { breakfast:[], lunch:[], dinner:[] }, shoppingList: [] } ]
	meals: {}, // userId -> [ { id, recipeId, name, portion, calories, macros, loggedAt } ]
	feedbacks: {}, // userId -> [ { recipeId, stars, comment, difficulty } ]
	notifications: []
};

// Seed một số công thức mẫu
db.recipes = [
	{
		id: 'r1',
		name: 'Salad ức gà',
		ingredients: [
			{ name: 'Ức gà', quantity: 200, unit: 'g' },
			{ name: 'Rau xà lách', quantity: 100, unit: 'g' },
			{ name: 'Dầu olive', quantity: 10, unit: 'ml' }
		],
		timeMinutes: 20,
		priceLevel: 2,
		vegan: false,
		proteinRich: true,
		nutrition: { calories: 320, protein: 35, carb: 8, fat: 15 }
	},
	{
		id: 'r2',
		name: 'Yến mạch sữa hạnh nhân',
		ingredients: [
			{ name: 'Yến mạch', quantity: 60, unit: 'g' },
			{ name: 'Sữa hạnh nhân', quantity: 200, unit: 'ml' },
			{ name: 'Chuối', quantity: 1, unit: 'quả' }
		],
		timeMinutes: 10,
		priceLevel: 1,
		vegan: true,
		proteinRich: false,
		nutrition: { calories: 280, protein: 8, carb: 45, fat: 6 }
	},
	{
		id: 'r3',
		name: 'Đậu hũ xào rau củ',
		ingredients: [
			{ name: 'Đậu hũ', quantity: 150, unit: 'g' },
			{ name: 'Bông cải xanh', quantity: 150, unit: 'g' },
			{ name: 'Cà rốt', quantity: 50, unit: 'g' }
		],
		timeMinutes: 15,
		priceLevel: 1,
		vegan: true,
		proteinRich: true,
		nutrition: { calories: 260, protein: 18, carb: 20, fat: 10 }
	}
];
function persist() { saveData(db); }

module.exports = { db, persist };


