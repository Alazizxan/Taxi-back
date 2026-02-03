# 🚕 LOCAL TAXI PLATFORM

## Telegram Bot & Driver App – FULL FLOW DOCUMENTATION

Bu hujjat **backend + Telegram bot + Driver mobile app** uchun yagona manba hisoblanadi.
Frontend (bot/app) ishlab chiquvchi shu faylga qarab **muammosiz** integratsiya qiladi.

---

## 🤖 TELEGRAM BOT FLOW (USER)
> Telegram user **passwordsiz** ishlaydi. Identifikatsiya `telegramId` orqali.

### 1️⃣ /start
**Maqsad:** User’ni ro‘yxatdan o‘tkazish yoki login qilish

**API:**
```
POST /auth/telegram
```

**Body:**
```json
{
  "telegramId": 123456789,
  "name": "Ali",
  "phone": "+998901234567"
}
```

**Response:**
```json
{
  "token": "JWT_TOKEN"
}
```

> Bot JWT tokenni session/memory’da saqlaydi va keyingi barcha so‘rovlarda yuboradi.

---

### 2️⃣ User location olish
Bot `request_location` tugmasini chiqaradi.

**API:**
```
PATCH /users/location
Authorization: Bearer JWT
```

**Body:**
```json
{
  "lng": 69.2401,
  "lat": 41.2995
}
```

> ⚠️ Location **har bir yangi buyurtmada yangilanadi** (eski ustiga yoziladi).

---

### 3️⃣ Manzil kiritish
Bot userdan matn sifatida manzilni so‘raydi.

Misol:
```
Chorsu bozori
```

---

### 4️⃣ Taxi chaqirish

**API:**
```
POST /orders/taxi
Authorization: Bearer JWT
```

**Body:**
```json
{
  "destinationText": "Chorsu bozori",
  "distanceKm": 5.6
}
```

> `distanceKm` bot tomonidan **Google Maps / Yandex API** orqali hisoblanadi.

**Response:**
```json
{
  "orderId": "65fa1c9b...",
  "status": "requested",
  "estimatedPrice": 15000,
  "estimatedTimeMin": 7
}
```

---

### 5️⃣ Kutish (polling)
Bot har 5–10 soniyada order holatini tekshiradi.

**API:**
```
GET /orders/{orderId}
Authorization: Bearer JWT
```

Agar driver topilsa:
```json
{
  "status": "accepted",
  "driver": {
    "name": "Driver 1",
    "phone": "+998911111111"
  },
  "vehicle": {
    "model": "Cobalt",
    "color": "White",
    "plateNumber": "01A123AA"
  }
}
```

Bot userga xabar beradi:
```
🚕 Taxi yo‘lda
⏱ 7 daqiqada yetib keladi
🚘 Oq Cobalt – 01A123AA
```

---

### 6️⃣ Safar tugashi
Bot faqat natijani ko‘rsatadi:
```
Safar yakunlandi
💰 Narx: 18 000 so‘m
```

---

## 📱 DRIVER APP FLOW
> Driver **password bilan** login qiladi. App real vaqt rejimida ishlaydi.

### 1️⃣ Login
```
POST /auth/driver/login
```

**Body:**
```json
{
  "phone": "+998911111111",
  "password": "123456"
}
```

---

### 2️⃣ Online (heartbeat)
Driver app ochilganda va keyin har 15–20 soniyada yuboriladi.

```
POST /drivers/heartbeat
Authorization: Bearer JWT
```

> Agar heartbeat kelmasa → backend driver’ni **offline** qiladi (cron orqali).

---

### 3️⃣ Driver location update
Har 5–10 soniyada.

```
PATCH /drivers/location
Authorization: Bearer JWT
```

```json
{
  "lng": 69.2405,
  "lat": 41.3001
}
```

> Shu ma’lumot orqali **real masofa** hisoblanadi.

---

### 4️⃣ Aktiv zakazni olish

```
GET /drivers/orders/active
Authorization: Bearer JWT
```

Agar zakaz bo‘lsa:
```json
{
  "orderId": "65fa1c9b...",
  "pickupLocation": { "coordinates": [69.24, 41.29] },
  "estimatedPrice": 15000
}
```

---

### 5️⃣ Accept

```
PATCH /drivers/orders/{id}/accept
```

> 15 soniya ichida accept qilinmasa → **auto-reject**.

---

### 6️⃣ Arrived

```
PATCH /drivers/orders/{id}/arrived
```

> Agar kutish bo‘lsa, shu paytdan `waiting` hisoblanadi.

---

### 7️⃣ Started

```
PATCH /drivers/orders/{id}/started
```

> Shu paytdan real masofa hisoblanadi (`actualDistanceKm`).

---

### 8️⃣ Finished

```
PATCH /drivers/orders/{id}/finished
```

Backend bajaradi:
- real masofa hisoblash
- final price chiqarish
- komissiyani wallet’dan yechish
- wallet 0 bo‘lsa → driver OFFLINE

**Response:**
```json
{
  "finalDistanceKm": 6.1,
  "finalPrice": 18300,
  "commission": 1830
}
```

---

## 🔐 ASOSIY QOIDALAR

- Telegram user → **password YO‘Q**
- Driver → **password BOR**
- Location → har safar yangilanadi
- Wallet 0 → driver online bo‘la olmaydi
- Masofa → driver location stream orqali hisoblanadi

---

## ✅ XULOSA

Bu hujjat bilan:
- 🤖 Telegram bot yoziladi
- 📱 Driver app yoziladi
- ⚙️ Backend bilan chalkashlik bo‘lmaydi
- 🚀 Production-ready MVP tayyor

