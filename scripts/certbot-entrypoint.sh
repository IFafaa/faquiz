#!/bin/sh
set -eu

if [ -z "${CERTBOT_EMAIL:-}" ]; then
  echo "CERTBOT_EMAIL vazio. Defina CERTBOT_EMAIL (ex.: no GitHub Secrets/Vars) para emitir o certificado."
  # continua rodando (renew) pra não crash-loop, mas não emite cert inicial
fi

DOMAINS="${CERTBOT_DOMAINS:-faquiz.com.br,www.faquiz.com.br}"
PRIMARY_DOMAIN="$(printf '%s' "$DOMAINS" | awk -F',' '{print $1}')"
LIVE_DIR="/etc/letsencrypt/live/${PRIMARY_DOMAIN}"

domain_args=""
OLD_IFS="$IFS"
IFS=","
for d in $DOMAINS; do
  d_trim="$(printf '%s' "$d" | tr -d ' ')"
  if [ -n "$d_trim" ]; then
    domain_args="$domain_args -d $d_trim"
  fi
done
IFS="$OLD_IFS"

issue_cert_if_missing() {
  if [ -d "$LIVE_DIR" ] && [ -f "$LIVE_DIR/fullchain.pem" ] && [ -f "$LIVE_DIR/privkey.pem" ]; then
    echo "Cert já existe em $LIVE_DIR"
    return 0
  fi

  if [ -z "${CERTBOT_EMAIL:-}" ]; then
    echo "Sem CERTBOT_EMAIL; pulando emissão inicial."
    return 0
  fi

  echo "Emitindo certificado inicial para: $DOMAINS"
  certbot certonly \
    --webroot -w /var/www/certbot \
    --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email \
    $domain_args

  echo "Recarregando nginx ($NGINX_CONTAINER_NAME) após emissão inicial"
  docker kill -s HUP "$NGINX_CONTAINER_NAME" >/dev/null 2>&1 || true
}

renew_forever() {
  while :; do
    echo "Renovando certificados (se necessário)..."
    certbot renew --webroot -w /var/www/certbot --quiet || true
    docker kill -s HUP "$NGINX_CONTAINER_NAME" >/dev/null 2>&1 || true
    sleep 12h
  done
}

issue_cert_if_missing
renew_forever

