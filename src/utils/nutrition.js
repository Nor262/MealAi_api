'use strict';

// Tính BMR theo Mifflin-St Jeor
function computeBMR({ age, gender, weight, height }) {
	if (!age || !gender || !weight || !height) return null;
	const w = Number(weight);
	const h = Number(height);
	const a = Number(age);
	if (Number.isNaN(w) || Number.isNaN(h) || Number.isNaN(a)) return null;
	const base = 10 * w + 6.25 * h - 5 * a;
	return gender === 'male' ? base + 5 : base - 161;
}

// Hệ số hoạt động: sedentary=1.2, light=1.375, moderate=1.55, active=1.725, very_active=1.9
function computeTDEE(bmr, activityLevel = 'moderate') {
	if (!bmr) return null;
	const map = {
		sedentary: 1.2,
		light: 1.375,
		moderate: 1.55,
		active: 1.725,
		very_active: 1.9
	};
	const factor = map[activityLevel] || map.moderate;
	return Math.round(bmr * factor);
}

function getCalorieRange(tdee, goal = 'maintain') {
	if (!tdee) return null;
	let min = tdee, max = tdee;
	if (goal === 'lose') { min = Math.round(tdee * 0.8); max = Math.round(tdee * 0.9); }
	else if (goal === 'gain') { min = Math.round(tdee * 1.1); max = Math.round(tdee * 1.2); }
	return { min, max };
}

module.exports = { computeBMR, computeTDEE, getCalorieRange };


