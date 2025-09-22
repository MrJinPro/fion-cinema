# ViOn Cinema - Онлайн каталог фильмов и сериалов

![ViOn Cinema](public/vion-logo.svg)

ViOn Cinema - это современное веб-приложение для поиска и организации информации о фильмах и сериалах. Проект использует TMDb API для получения актуальных данных о кинематографическом контенте.

## 🎬 Особенности

- **Поиск и фильтрация**: Мощная система поиска с фильтрами по жанрам, годам, рейтингу
- **Детальная информация**: Подробные страницы фильмов, сериалов и актёров
- **Избранное**: Персональный список любимых фильмов и сериалов
- **Пользовательские списки**: Создание тематических коллекций
- **Адаптивный дизайн**: Оптимизирован для всех устройств
- **Неоновая тема**: Современный тёмный дизайн с неоновыми акцентами
- **PWA поддержка**: Возможность установки как приложение

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ и npm
- TMDb API ключ (получить на [themoviedb.org](https://www.themoviedb.org/settings/api))

### Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone <YOUR_GIT_URL>
   cd vion-cinema
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Отредактируйте `.env.local` и добавьте ваш TMDb API ключ:
   ```env
   TMDB_API_KEY=ваш_tmdb_api_ключ
   REDIS_URL=redis://localhost:6379  # опционально
   NEXT_PUBLIC_APP_NAME=ViOn
   NEXT_PUBLIC_DEFAULT_LOCALE=ru
   NEXT_PUBLIC_ANALYTICS=off
   ```

4. **Запустите приложение**
   ```bash
   npm run dev
   ```

   Приложение будет доступно по адресу [http://localhost:8080](http://localhost:8080)

## 📝 Скрипты

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для production
- `npm run start` - Запуск production сборки
- `npm run preview` - Предварительный просмотр production сборки
- `npm run lint` - Проверка кода линтером
- `npm run typecheck` - Проверка типов TypeScript

## 🛠 Технологический стек

- **Frontend**: React 18, TypeScript, Vite
- **Стилизация**: Tailwind CSS, shadcn/ui
- **Роутинг**: React Router
- **State Management**: TanStack Query
- **Формы**: React Hook Form + Zod
- **Иконки**: Lucide React
- **API**: TMDb (The Movie Database)
- **Хранилище**: IndexedDB (с fallback на LocalStorage)

## 🐳 Docker

### Сборка образа

```bash
docker build -t vion-cinema .
```

### Запуск с Docker Compose

```bash
docker-compose up -d
```

Это запустит приложение с Redis для кэширования.

## 🔧 Конфигурация

### TMDb API

Приложение использует TMDb API для получения данных о фильмах и сериалах. Для работы требуется бесплатный API ключ:

1. Зарегистрируйтесь на [themoviedb.org](https://www.themoviedb.org)
2. Перейдите в [настройки API](https://www.themoviedb.org/settings/api)
3. Создайте новый API ключ
4. Добавьте ключ в `.env.local`

### Кэширование

Приложение поддерживает несколько уровней кэширования:

- **Клиентский LRU кэш**: В памяти браузера (TTL: 24 часа)
- **Redis** (опционально): Серверное кэширование при наличии `REDIS_URL`

### Аналитика

Добавлена заглушка для аналитики. Для подключения реального провайдера:

1. Установите `NEXT_PUBLIC_ANALYTICS=on`
2. Реализуйте интеграцию в `lib/analytics.ts`

## 📱 PWA

Приложение поддерживает Progressive Web App функциональность:

- Manifest для установки
- Service Worker для офлайн кэширования
- Кэширование критических ресурсов

## 📋 Структура проекта

```
src/
├── components/           # React компоненты
│   ├── ui/              # UI компоненты (shadcn/ui)
│   └── layout/          # Компоненты лэйаута
├── pages/               # Страницы приложения
├── lib/                 # Утилиты и библиотеки
│   ├── tmdb.ts         # TMDb API SDK
│   ├── storage.ts      # Локальное хранилище
│   └── utils.ts        # Общие утилиты
├── hooks/              # React хуки
└── styles/             # Стили (Tailwind)
```

## 🎨 Дизайн система

Приложение использует неоновую тёмную тему с акцентами:

- **Primary**: Фиолетовый (#7C3AED)
- **Accent**: Бирюза (#06B6D4) 
- **Info**: Синий (#3B82F6)
- **Orange**: Оранжевый (#FF8500)

Все цвета определены в `src/index.css` и настроены через CSS переменные.

## 📖 API Reference

### TMDb SDK

```typescript
import { getTMDbClient } from '@/lib/tmdb';

const tmdb = getTMDbClient();

// Поиск фильмов
const movies = await tmdb.searchMovies('Дюна');

// Детали фильма
const movie = await tmdb.getMovieDetails(123);

// Трендовое
const trending = await tmdb.getTrending('movie', 'week');
```

### Локальное хранилище

```typescript
import { getStorageRepository } from '@/lib/storage';

const storage = getStorageRepository();

// Избранное
await storage.addToFavorites(favoriteItem);
const favorites = await storage.getFavorites();

// Списки
const list = await storage.createList('Мои комедии');
await storage.addToList(list.id, item);
```

## 🔒 Безопасность

- TMDb API ключ хранится только на сервере
- Клиент обращается к TMDb через наши API роуты
- Rate limiting: 30 запросов в минуту на IP
- Безопасные заголовки (CSP, Referrer-Policy)

## 📊 Performance

Целевые показатели Lighthouse:

- **Performance**: ≥90
- **SEO**: ≥90  
- **Accessibility**: ≥90
- **Best Practices**: ≥90

## 📄 Лицензия и атрибуция

### TMDb

Все данные о фильмах предоставлены [The Movie Database (TMDb)](https://www.themoviedb.org/).

**Важно**: 
- Данный продукт использует TMDb API, но не поддерживается и не сертифицирован TMDb
- При коммерческом использовании требуется получение коммерческой лицензии TMDb
- Текущая версия предназначена только для некоммерческого использования

### Использование

Этот проект создан в образовательных целях и как демонстрация технических возможностей. 

**Ограничения**:
- Некоммерческое использование
- Не предназначен для распространения защищённого контента
- Только информационные цели

## 🤝 Вклад в развитие

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Закоммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📞 Поддержка

- **Разработчик**: MrJinPro
- **Email**: contact@mrjinpro.dev
- **GitHub**: [@MrJinPro](https://github.com/MrJinPro)

## 🔗 Полезные ссылки

- [TMDb API Documentation](https://developers.themoviedb.org/)
- [TMDb Terms of Use](https://www.themoviedb.org/terms-of-use)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

© 2024 ViOn Cinema. Разработано MrJinPro. Некоммерческое использование.