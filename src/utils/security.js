'use strict';

const crypto = require('crypto');

const SECRET = process.env.SECRET || 'demo-secret-key-please-change';

function encryptSensitive(plainText) {
	if (!plainText) return null;
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv('aes-256-cbc', crypto.scryptSync(SECRET, 'salt', 32), iv);
	let enc = cipher.update(String(plainText), 'utf8', 'base64');
	enc += cipher.final('base64');
	return iv.toString('base64') + ':' + enc;
}

function decryptSensitive(encText) {
	if (!encText) return null;
	const [ivStr, data] = String(encText).split(':');
	const iv = Buffer.from(ivStr, 'base64');
	const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.scryptSync(SECRET, 'salt', 32), iv);
	let dec = decipher.update(data, 'base64', 'utf8');
	dec += decipher.final('utf8');
	return dec;
}

module.exports = { encryptSensitive, decryptSensitive };


