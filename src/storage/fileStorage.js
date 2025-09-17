'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

function ensureDir() {
	if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadData() {
	try {
		ensureDir();
		if (!fs.existsSync(DATA_FILE)) return null;
		const raw = fs.readFileSync(DATA_FILE, 'utf8');
		return JSON.parse(raw);
	} catch (_) {
		return null;
	}
}

function saveData(data) {
	ensureDir();
	fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { loadData, saveData };


