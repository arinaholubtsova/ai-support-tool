# AI-обробка звернень

Внутрішній інструмент підтримки клієнтів на базі **Next.js 14 App Router** + **Anthropic Claude** + **Prisma ORM**.

---

## Стек технологій

| Шар           | Технологія                       |
|---------------|----------------------------------|
| Framework     | Next.js 14 (App Router, TypeScript) |
| Styling       | Tailwind CSS                     |
| Database      | Prisma ORM · SQLite (dev) / PostgreSQL (prod) |
| AI            | Anthropic SDK (`claude-sonnet-4-6`)  |
| Deployment    | Vercel                           |

---

## Функціональність

- ✅ Додавання звернень клієнтів (ім'я + текст)
- ✅ Збереження в БД без перезавантаження сторінки
- ✅ AI-аналіз кожного звернення (пріоритет, категорія, підсумок, чернетка відповіді)
- ✅ Колірно-кодовані бейджі пріоритету (🔴 Високий / 🟡 Середній / 🟢 Низький)
- ✅ Бейджі категорії (💳 Оплата / 📦 Доставка / ⚠️ Скарга / 📋 Інше)
- ✅ Кнопка «Копіювати відповідь» з підтвердженням
- ✅ Фільтр звернень за пріоритетом
- ✅ Статистична панель (загальна кількість, проаналізовано, за пріоритетами)
- ✅ Skeleton-завантаження та стан порожнього списку

---

## Швидкий старт

### 1. Клонування та встановлення залежностей

```bash
git clone <repo-url>
cd ai-support-tool
npm install
```

### 2. Налаштування змінних середовища

```bash
cp .env.example .env
```

Відредагуйте `.env`:

```env
# SQLite (для локальної розробки — нічого міняти не потрібно)
DATABASE_URL="file:./prisma/dev.db"

# Ваш ключ Anthropic API
ANTHROPIC_API_KEY="sk-ant-..."
```

Отримати ключ API можна на [console.anthropic.com](https://console.anthropic.com).

### 3. Ініціалізація бази даних

```bash
npx prisma db push
# або для міграцій:
npx prisma migrate dev --name init
```

### 4. Запуск

```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000).

---

## Prisma — корисні команди

```bash
npm run db:push      # Застосувати схему до БД (без міграції)
npm run db:migrate   # Створити та застосувати міграцію
npm run db:studio    # Відкрити Prisma Studio (GUI для БД)
npm run db:generate  # Перегенерувати Prisma Client
```

---

## Структура проєкту

```
ai-support-tool/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts     # POST /api/analyze  — AI-аналіз тікету
│   │   └── tickets/route.ts     # GET / POST /api/tickets
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Головна сторінка (Client Component)
├── components/
│   ├── TicketCard.tsx           # Картка звернення з AI-результатами
│   └── TicketForm.tsx           # Форма додавання звернення
├── lib/
│   └── prisma.ts                # Prisma Client singleton
├── prisma/
│   └── schema.prisma            # Схема БД
├── types/
│   └── ticket.ts                # TypeScript типи
└── .env.example
```

---

## Деплой на Vercel

### 1. Перейти на PostgreSQL

У `prisma/schema.prisma` замінити:

```prisma
datasource db {
  provider = "postgresql"   # ← було "sqlite"
  url      = env("DATABASE_URL")
}
```

Потім:

```bash
npx prisma migrate dev --name switch-to-postgres
```

### 2. Налаштувати БД на Vercel

1. У Vercel Dashboard → **Storage** → підключіть **Vercel Postgres** (або Neon, Supabase тощо).
2. Скопіюйте `DATABASE_URL` до **Environment Variables** у вашому Vercel проєкті.
3. Додайте `ANTHROPIC_API_KEY` до Environment Variables.

### 3. Deploy

```bash
vercel --prod
```

Або просто пушніть у `main` — Vercel задеплоїть автоматично.

---

## API Reference

### `GET /api/tickets`
Повертає всі звернення, відсортовані за датою (нові — першими).

### `POST /api/tickets`
```json
{ "clientName": "Іван Іваненко", "text": "Текст звернення..." }
```

### `POST /api/analyze`
```json
{ "ticketId": "uuid-тут" }
```
Викликає Claude API, зберігає результат у БД і повертає оновлений тікет:
```json
{
  "priority": "середній",
  "category": "доставка",
  "summary": "Клієнт не отримав замовлення вже 2 тижні.",
  "draftResponse": "Шановний Іване..."
}
```

---

## Ліцензія

MIT
