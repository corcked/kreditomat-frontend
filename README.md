# Kreditomat Frontend

Веб-интерфейс для сервиса-агрегатора микрозаймов Kreditomat.

## Технологический стек

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **Forms**: React Hook Form + Zod
- **State Management**: React Context + SWR
- **API Client**: Axios

## Основные возможности

- Авторизация через SMS (Telegram Gateway)
- Калькулятор микрозаймов с автокоррекцией ПДН
- Система скоринга с визуализацией
- Многошаговые формы для сбора данных
- Адаптивный дизайн для всех устройств
- Реферальная программа

## Структура проекта

```
kreditomat-frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Страницы авторизации
│   ├── (main)/            # Основные страницы
│   ├── api/               # API routes (если нужны)
│   ├── layout.tsx         # Корневой layout
│   └── page.tsx           # Главная страница
├── components/            # React компоненты
│   ├── ui/               # shadcn/ui компоненты
│   ├── layout/           # Layout компоненты
│   └── ...               # Другие компоненты
├── lib/                   # Утилиты и helpers
│   ├── api.ts            # API клиент
│   ├── auth.ts           # Авторизация
│   └── utils.ts          # Общие утилиты
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── types/                # TypeScript типы
├── public/               # Статические файлы
└── styles/               # Глобальные стили
```

## Установка и запуск

### Требования

- Node.js 18+
- npm или yarn

### Локальная разработка

1. Клонировать репозиторий:
```bash
git clone https://github.com/[your-username]/kreditomat-frontend.git
cd kreditomat-frontend
```

2. Установить зависимости:
```bash
npm install
```

3. Настроить переменные окружения:
```bash
cp .env.example .env.local
# Отредактировать .env.local файл
```

4. Запустить dev сервер:
```bash
npm run dev
```

Приложение будет доступно на http://localhost:3000

### Production сборка

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t kreditomat-frontend .
docker run -p 3000:3000 --env-file .env kreditomat-frontend
```

## Переменные окружения

- `NEXT_PUBLIC_API_URL` - URL backend API
- `NEXT_PUBLIC_APP_URL` - URL приложения

## Основные маршруты

- `/` - Главная страница с калькулятором
- `/verify` - Страница верификации SMS
- `/offer` - Предварительное предложение
- `/personal` - Форма персональных данных
- `/final` - Финальные предложения

## Тестирование

```bash
# Unit тесты
npm test

# E2E тесты
npm run test:e2e
```

## Deployment

Проект настроен для деплоя на Railway.app или Vercel

## Лицензия

Proprietary