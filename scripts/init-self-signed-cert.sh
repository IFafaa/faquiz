#!/bin/sh
set -eu

DOMAINS="${CERTBOT_DOMAINS:-faquiz.com.br,www.faquiz.com.br}"
PRIMARY_DOMAIN="${DOMAINS%%,*}"
LIVE_DIR="/etc/letsencrypt/live/${PRIMARY_DOMAIN}"

# Se já existe cert, não faz nada.
if [ -f "${LIVE_DIR}/fullchain.pem" ] && [ -f "${LIVE_DIR}/privkey.pem" ]; then
  echo "Cert já existe em ${LIVE_DIR}; pulando init."
  exit 0
fi

echo "Gerando certificado autoassinado temporário para ${PRIMARY_DOMAIN} (apenas para o nginx subir)."

apk add --no-cache openssl >/dev/null
mkdir -p "${LIVE_DIR}"

openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout "${LIVE_DIR}/privkey.pem" \
  -out "${LIVE_DIR}/fullchain.pem" \
  -subj "/CN=${PRIMARY_DOMAIN}" >/dev/null 2>&1

echo "OK: autoassinado criado em ${LIVE_DIR}."

