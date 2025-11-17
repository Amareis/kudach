#!/bin/bash

# Скрипт для деплоя OAuth функции на Yandex Cloud с использованием Lockbox
# Использование: ./scripts/deploy-oauth.sh

set -e  # Остановить при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Деплой OAuth функции на Yandex Cloud ===${NC}\n"

# Проверка наличия yc CLI
if ! command -v yc &> /dev/null; then
    echo -e "${RED}Ошибка: yc CLI не установлен${NC}"
    echo -e "${YELLOW}Установите: https://cloud.yandex.ru/docs/cli/quickstart${NC}"
    exit 1
fi

# Загрузить переменные окружения (только публичные данные)
echo -e "${YELLOW}Загрузка конфигурации...${NC}"
if [ -f .env.deploy ]; then
    source .env.deploy
fi

# Проверка обязательных переменных
if [ -z "$VK_APP_ID" ] || [ -z "$FIREBASE_PROJECT_ID" ] || [ -z "$FIREBASE_CLIENT_EMAIL" ]; then
    echo -e "${RED}Ошибка: Не все переменные окружения заполнены в .env.deploy${NC}"
    echo -e "${YELLOW}Требуются: VK_APP_ID, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL${NC}"
    exit 1
fi

# Проверка наличия Lockbox секретов
echo -e "${YELLOW}Проверка Lockbox секретов...${NC}"

# Имя секрета в Lockbox (один секрет содержит оба ключа)
LOCKBOX_SECRET_NAME="kudach sercrets"

# Проверить существование секрета
SECRET_ID=$(yc lockbox secret list --format json | jq -r ".[] | select(.name==\"$LOCKBOX_SECRET_NAME\") | .id")

if [ -z "$SECRET_ID" ]; then
    echo -e "${RED}Ошибка: Секрет '$LOCKBOX_SECRET_NAME' не найден в Lockbox${NC}"
    echo -e "${YELLOW}Создайте секрет с обоими ключами:${NC}"
    echo -e "  yc lockbox secret create --name \"$LOCKBOX_SECRET_NAME\" \\"
    echo -e "    --payload '[{\"key\":\"VK_APP_SECRET\",\"text_value\":\"YOUR_VK_SECRET\"},"
    echo -e "               {\"key\":\"FIREBASE_PRIVATE_KEY\",\"text_value\":\"YOUR_FIREBASE_KEY\"}]'"
    exit 1
fi

# Проверить, что секрет содержит оба ключа
PAYLOAD_KEYS=$(/Users/plesskih/yandex-cloud/bin/yc lockbox secret get $SECRET_ID --format json | jq -r '.current_version.payload_entry_keys[]')

if ! echo "$PAYLOAD_KEYS" | grep -q "VK_APP_SECRET"; then
    echo -e "${RED}Ошибка: Секрет не содержит ключ 'VK_APP_SECRET'${NC}"
    exit 1
fi

if ! echo "$PAYLOAD_KEYS" | grep -q "FIREBASE_PRIVATE_KEY"; then
    echo -e "${RED}Ошибка: Секрет не содержит ключ 'FIREBASE_PRIVATE_KEY'${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Lockbox секрет найден:${NC}"
echo -e "  - Secret ID: ${BLUE}$SECRET_ID${NC}"
echo -e "  - Keys: ${BLUE}VK_APP_SECRET, FIREBASE_PRIVATE_KEY${NC}\n"

# Перейти в директорию функции
cd yandex-functions/authvk

# Установить зависимости
echo -e "${YELLOW}Установка зависимостей...${NC}"
yarn install
echo -e "${GREEN}✓ Зависимости установлены${NC}\n"

# Собрать функцию с помощью esbuild
echo -e "${YELLOW}Сборка функции...${NC}"
yarn build
echo -e "${GREEN}✓ Функция собрана${NC}\n"

# Проверить существование функции
FUNCTION_EXISTS=$(yc serverless function list --format json | jq -r '.[] | select(.name=="authvk") | .id')

if [ -z "$FUNCTION_EXISTS" ]; then
    # Создать функцию
    echo -e "${YELLOW}Создание функции authvk...${NC}"
    yc serverless function create \
        --name authvk \
        --description "VK OAuth authentication with PKCE"
    echo -e "${GREEN}✓ Функция создана${NC}\n"
else
    echo -e "${GREEN}✓ Функция authvk уже существует${NC}\n"
fi

# Получить Service Account для доступа к Lockbox
echo -e "${YELLOW}Настройка Service Account...${NC}"

# Получить или создать Service Account
SA_NAME="authvk-sa"
SA_ID=$(/Users/plesskih/yandex-cloud/bin/yc iam service-account list --format json | jq -r ".[] | select(.name==\"$SA_NAME\") | .id")

if [ -z "$SA_ID" ]; then
    echo -e "${YELLOW}Создание Service Account '$SA_NAME'...${NC}"
    SA_ID=$(/Users/plesskih/yandex-cloud/bin/yc iam service-account create --name $SA_NAME --format json | jq -r '.id')
    echo -e "${GREEN}✓ Service Account создан: $SA_ID${NC}"

    # Назначить роль для доступа к Lockbox
    FOLDER_ID=$(/Users/plesskih/yandex-cloud/bin/yc config get folder-id)
    echo -e "${YELLOW}Назначение роли lockbox.payloadViewer...${NC}"
    /Users/plesskih/yandex-cloud/bin/yc resource-manager folder add-access-binding $FOLDER_ID \
        --role lockbox.payloadViewer \
        --service-account-id $SA_ID \
        2>/dev/null || echo -e "${BLUE}Роль уже назначена${NC}"

    echo -e "${GREEN}✓ Service Account настроен${NC}\n"
else
    echo -e "${GREEN}✓ Service Account найден: $SA_ID${NC}"
fi

# Получить текущий URL функции (если функция уже существует)
CURRENT_FUNCTION_URL=$(yc serverless function get authvk --format json 2>/dev/null | jq -r '.http_invoke_url // empty')

# Создать версию функции из собранного бандла с Lockbox секретами
echo -e "${YELLOW}Деплой версии функции с Lockbox секретами...${NC}"

# Если URL уже известен, передаем его в переменные окружения
if [ -n "$CURRENT_FUNCTION_URL" ]; then
    echo -e "${BLUE}Используем существующий URL функции: $CURRENT_FUNCTION_URL${NC}"
    /Users/plesskih/yandex-cloud/bin/yc serverless function version create \
        --function-name authvk \
        --runtime nodejs18 \
        --entrypoint index.handler \
        --memory 256m \
        --execution-timeout 10s \
        --source-path dist \
        --service-account-id $SA_ID \
        --environment VK_APP_ID="$VK_APP_ID" \
        --environment FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID" \
        --environment FIREBASE_CLIENT_EMAIL="$FIREBASE_CLIENT_EMAIL" \
        --environment FUNCTION_URL="$CURRENT_FUNCTION_URL" \
        --secret id="$SECRET_ID",key=VK_APP_SECRET,environment-variable=VK_APP_SECRET \
        --secret id="$SECRET_ID",key=FIREBASE_PRIVATE_KEY,environment-variable=FIREBASE_PRIVATE_KEY
else
    echo -e "${YELLOW}Первый деплой - URL будет доступен после создания версии${NC}"
    /Users/plesskih/yandex-cloud/bin/yc serverless function version create \
        --function-name authvk \
        --runtime nodejs18 \
        --entrypoint index.handler \
        --memory 256m \
        --execution-timeout 10s \
        --source-path dist \
        --service-account-id $SA_ID \
        --environment VK_APP_ID="$VK_APP_ID" \
        --environment FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID" \
        --environment FIREBASE_CLIENT_EMAIL="$FIREBASE_CLIENT_EMAIL" \
        --secret id="$SECRET_ID",key=VK_APP_SECRET,environment-variable=VK_APP_SECRET \
        --secret id="$SECRET_ID",key=FIREBASE_PRIVATE_KEY,environment-variable=FIREBASE_PRIVATE_KEY
fi

echo -e "${GREEN}✓ Версия функции задеплоена с Lockbox секретами${NC}\n"

# Сделать функцию публичной
echo -e "${YELLOW}Настройка публичного доступа...${NC}"
yc serverless function allow-unauthenticated-invoke authvk
echo -e "${GREEN}✓ Функция доступна публично${NC}\n"

# Получить URL функции
FUNCTION_URL=$(yc serverless function get authvk --format json | jq -r '.http_invoke_url')

echo -e "${GREEN}=== Деплой завершен успешно! ===${NC}\n"
echo -e "URL функции: ${GREEN}$FUNCTION_URL${NC}\n"

# Если это был первый деплой, нужно задеплоить еще раз с FUNCTION_URL
if [ -z "$CURRENT_FUNCTION_URL" ]; then
    echo -e "${YELLOW}Обновление функции с FUNCTION_URL...${NC}"
    cd yandex-functions/authvk
    /Users/plesskih/yandex-cloud/bin/yc serverless function version create \
        --function-name authvk \
        --runtime nodejs18 \
        --entrypoint index.handler \
        --memory 256m \
        --execution-timeout 10s \
        --source-path dist \
        --service-account-id $SA_ID \
        --environment VK_APP_ID="$VK_APP_ID" \
        --environment FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID" \
        --environment FIREBASE_CLIENT_EMAIL="$FIREBASE_CLIENT_EMAIL" \
        --environment FUNCTION_URL="$FUNCTION_URL" \
        --secret id="$SECRET_ID",key=VK_APP_SECRET,environment-variable=VK_APP_SECRET \
        --secret id="$SECRET_ID",key=FIREBASE_PRIVATE_KEY,environment-variable=FIREBASE_PRIVATE_KEY
    cd ../..
    echo -e "${GREEN}✓ Функция обновлена с FUNCTION_URL${NC}\n"
fi

# Обновить .env на фронтенде
cd ../..
echo -e "${YELLOW}Обновление .env...${NC}"

# Создать или обновить .env
if [ -f ".env" ]; then
    # Обновить существующий .env
    if grep -q "VITE_AUTH_FUNCTION_URL" .env; then
        sed -i.bak "s|VITE_AUTH_FUNCTION_URL=.*|VITE_AUTH_FUNCTION_URL=$FUNCTION_URL|" .env
    else
        echo "VITE_AUTH_FUNCTION_URL=$FUNCTION_URL" >> .env
    fi
else
    # Создать новый .env
    cat > .env << EOF
VITE_VK_APP_ID=$VK_APP_ID
VITE_AUTH_FUNCTION_URL=$FUNCTION_URL
EOF
fi

echo -e "${GREEN}✓ .env обновлен${NC}\n"

# Инструкции для следующих шагов
echo -e "${YELLOW}=== Следующие шаги ===${NC}\n"
echo "1. Обновите настройки VK App:"
echo "   - Откройте: https://dev.vk.com/apps"
echo "   - Добавьте Authorized redirect URI: $FUNCTION_URL"
echo ""
echo "2. Протестируйте авторизацию:"
echo "   - Запустите: yarn dev"
echo "   - Откройте: http://localhost:5173"
echo "   - Нажмите 'Войти через VK'"
echo ""
echo "3. Проверьте логи функции:"
echo "   - yc serverless function logs authvk --follow"
echo ""
echo "4. Проверьте данные в Firestore:"
echo "   - https://console.firebase.google.com/project/kusve-98f3c/firestore/data"
echo ""
echo -e "${BLUE}=== Управление секретами ===${NC}\n"
echo "Обновить VK Secret:"
echo "  yc lockbox secret update $LOCKBOX_VK_SECRET --payload '[{\"key\":\"value\",\"text_value\":\"NEW_SECRET\"}]'"
echo ""
echo "Обновить Firebase Private Key:"
echo "  yc lockbox secret update $LOCKBOX_FIREBASE_KEY --payload '[{\"key\":\"value\",\"text_value\":\"NEW_KEY\"}]'"
echo ""
