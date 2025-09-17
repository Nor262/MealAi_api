# Demo API Dinh Duong & Meal Planner (Express)

Chay nhanh:

```bash
npm install
npm run dev
# Health check: http://localhost:3000/health
```

Cac endpoint chinh (dung `:userId` tuy y, vi du `u1`):

- Ho so ca nhan
  - GET `/api/profile/:userId`
  - POST `/api/profile/:userId`
    - body vi du:

```json
{
  "age": 28,
  "gender": "male",
  "weight": 70,
  "height": 175,
  "activityLevel": "moderate",
  "conditions": ["tieu duong"],
  "allergies": ["dau phong"],
  "tastes": ["cay"],
  "goal": "maintain"
}
```

- Nguyen lieu

  - GET `/api/ingredients/:userId`
  - POST `/api/ingredients/:userId/manual`
  - POST `/api/ingredients/:userId/barcode`
  - POST `/api/ingredients/:userId/image`
  - GET `/api/ingredients/:userId/expiring`

- De xuat mon

  - POST `/api/recommend/:userId` body `{ "priorities": { "vegan": true, "proteinRich": true, "maxTime": 20 } }`
  - POST `/api/recommend/:userId/substitute` body `{ "recipeId": "r1" }`

- Meal Planner

  - POST `/api/planner/:userId` body `{ "scope": "week", "constraints": { "diet": "vegetarian" } }`
  - GET `/api/planner/:userId`

- Theo doi

  - POST `/api/tracking/:userId/log`
  - GET `/api/tracking/:userId/progress`
  - GET `/api/tracking/:userId/weekly-report`

- Danh gia & Chatbot
  - POST `/api/feedback/:userId/rate`
  - GET `/api/feedback/:userId`
  - POST `/api/chatbot/:userId`

NFR (demo):

- Bao mat: AES-256-CBC cho truong nhay cam (doi `SECRET`).
- Hieu nang: du lieu nho, dap ung <3s (demo). Thuc te can cache.
- Scale: nen stateless + DB ngoai khi trien khai that.
- Da nen tang: API REST cho Web/iOS/Android.
- UX: ho tro barcode/anh (demo gia lap).

Tich hop OpenAI:

- Tao file `.env` va dat khoa:

```bash
OPENAI_API_KEY=sk-proj-...
SECRET=change-me
```

- Diem dung AI:
  - Phan loai nguyen lieu tu anh: POST `/api/ingredients/:userId/image`
  - De xuat mon an: POST `/api/recommend/:userId`
  - Chatbot: POST `/api/chatbot/:userId`
