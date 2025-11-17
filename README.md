# Кудач

Progressive Web Application для управления событиями и мероприятиями с социальной составляющей.

## ✅ Статус проекта

**VK OAuth восстановлен!** Авторизация через ВКонтакте работает с новым VK ID API и PKCE.

## Технологии

### Frontend
- **Vue 2.7** с TypeScript
- **Vite 5** - быстрая сборка и dev-сервер
- **Vuetify 2** - Material Design UI
- **PWA** - офлайн поддержка

### Backend
- **Yandex Cloud Functions** - serverless функции
- **Firebase Firestore** - база данных
- **Firebase Auth** - аутентификация
- **Yandex Lockbox** - хранение секретов

### OAuth
- **VK ID API** - новый OAuth 2.1 с PKCE
- **PKCE** - защита от перехвата кода авторизации

## Установка

```bash
# Установка зависимостей
yarn install

# Установка зависимостей для Yandex Cloud функции
cd yandex-functions/authvk
yarn install
cd ../..
```

## Разработка

Запуск dev-сервера с hot-reload:
```bash
yarn dev
```

Приложение будет доступно на http://localhost:5173

## Деплой

### Деплой OAuth функции на Yandex Cloud

```bash
# Пересобрать функцию
cd yandex-functions/authvk
yarn build
cd ../..

# Задеплоить на Yandex Cloud
./scripts/deploy-oauth.sh
```

Скрипт автоматически:
- Проверит наличие секретов в Yandex Lockbox
- Создаст Service Account с правами доступа
- Задеплоит функцию с переменными окружения
- Обновит `.env` с URL функции

### Деплой фронтенда на Firebase

```bash
# Сборка для production
yarn build

# Деплой на Firebase Hosting
yarn deploy
```

## Настройка окружения

### 1. Создайте `.env.deploy` для публичных переменных

```bash
VK_APP_ID=your_vk_app_id
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
```

### 2. Создайте секрет в Yandex Lockbox

```bash
yc lockbox secret create \
  --name "kudach sercrets" \
  --payload '[
    {"key":"VK_APP_SECRET","text_value":"your_vk_secret"},
    {"key":"FIREBASE_PRIVATE_KEY","text_value":"your_firebase_private_key"}
  ]'
```

### 3. Настройте VK приложение

В настройках VK приложения (https://id.vk.com) добавьте:
- **Authorized redirect URI**: URL вашей Yandex Cloud функции

## Архитектура OAuth

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Browser   │────1───▶│   VK ID API  │────2───▶│ Yandex Function │
│  (Frontend) │◀───5────│              │◀───3────│    (authvk)     │
└─────────────┘         └──────────────┘         └─────────────────┘
                                                          │
                                                          │ 4
                                                          ▼
                                                  ┌───────────────┐
                                                  │   Firebase    │
                                                  │   Firestore   │
                                                  └───────────────┘
```

1. Пользователь нажимает "Войти через VK"
2. VK возвращает authorization code
3. Функция обменивает code на access_token (с PKCE)
4. Функция создает Firebase custom token
5. Браузер получает token и авторизуется

## Документация

- [`MIGRATION_PLAN.md`](./MIGRATION_PLAN.md) - план миграции на Yandex Cloud

## Линтинг

```bash
yarn lint[MIGRATION_PLAN.md](MIGRATION_PLAN.md)
```

## Проверка логов

```bash
# Логи Yandex Cloud функции
yc serverless function logs authvk --follow

# Логи Firebase
firebase functions:log
```

## Troubleshooting

### OAuth не работает

1. Проверьте консоль браузера (F12)
2. Проверьте логи функции: `yc serverless function logs authvk --follow`
3. Убедитесь, что redirect_uri совпадает в VK настройках и в коде
4. Проверьте, что секреты в Lockbox актуальны

### Функция не деплоится

1. Проверьте наличие yc CLI: `yc --version`
2. Проверьте авторизацию: `yc config list`
3. Проверьте секреты: `yc lockbox secret list`
4. Проверьте права Service Account

## Лицензия

Частный проект
