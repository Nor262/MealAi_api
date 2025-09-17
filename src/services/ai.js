'use strict';

const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
let client = null;
if (apiKey) {
	client = new OpenAI({ apiKey });
}

function ensureClient() {
	if (!client) throw new Error('OPENAI_API_KEY chưa được cấu hình');
	return client;
}

async function withRetry(fn, { retries = 3, baseMs = 500 } = {}) {
	let lastErr;
	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			return await fn();
		} catch (e) {
			lastErr = e;
			const status = e?.status || e?.response?.status;
			// Chỉ retry khi 429/5xx
			if (status !== 429 && !(status >= 500 && status < 600)) break;
			const jitter = Math.floor(Math.random() * 100);
			const delay = Math.min(4000, baseMs * Math.pow(2, attempt)) + jitter;
			await new Promise((r) => setTimeout(r, delay));
		}
	}
	throw lastErr;
}

async function classifyIngredient(imageUrl) {
	const c = ensureClient();
	const resp = await withRetry(() => c.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: 'Bạn là AI phân loại nguyên liệu ẩm thực. Trả về tên nguyên liệu đơn giản, tiếng Việt, 1-3 từ.' },
			{ role: 'user', content: [
				{ type: 'text', text: 'Phân loại nguyên liệu trong ảnh này.' },
				{ type: 'image_url', image_url: { url: imageUrl } }
			] }
		],
		max_tokens: 50,
		temperature: 0.2
	}));
	return (resp.choices?.[0]?.message?.content || '').trim();
}

async function recommendMeals({ profile, pantry, context }) {
	const c = ensureClient();
	const prompt = `Hãy đề xuất 3-5 món ăn phù hợp. Trả JSON với mảng items [{name, reason, estTime, nutrition:{calories,protein,carb,fat}}].\nHồ sơ: ${JSON.stringify(profile)}\nKho: ${JSON.stringify((pantry||[]).map(i=>i.name))}\nNgữ cảnh: ${JSON.stringify(context)}`;
	const resp = await withRetry(() => c.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: 'Bạn là chuyên gia dinh dưỡng. Chỉ trả về JSON hợp lệ.' },
			{ role: 'user', content: prompt }
		],
		response_format: { type: 'json_object' },
		max_tokens: 500,
		temperature: 0.3
	}));
	const text = resp.choices?.[0]?.message?.content || '{}';
	try { return JSON.parse(text); } catch { return { items: [] }; }
}

async function chatbotAnswer(question, userContext) {
	const c = ensureClient();
	const resp = await withRetry(() => c.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: 'Bạn là trợ lý dinh dưỡng, trả lời ngắn gọn, thực tế.' },
			{ role: 'user', content: `Ngữ cảnh: ${JSON.stringify(userContext)}\nCâu hỏi: ${question}` }
		],
		max_tokens: 200,
		temperature: 0.5
	}));
	return (resp.choices?.[0]?.message?.content || '').trim();
}

module.exports = { classifyIngredient, recommendMeals, chatbotAnswer };


