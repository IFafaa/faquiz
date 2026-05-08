#!/bin/sh
set -eu

if [ -z "${CERTBOT_EMAIL:-}" ]; then
  echo "CERTBOT_EMAIL vazio. Defina CERTBOT_EMAIL (ex.: no GitHub Secrets/Vars) para emitir o certificado."
  # continua rodando (renew) pra não crash-loop, mas não emite cert inicial
fi

DOMAINS="${CERTBOT_DOMAINS:-faquiz.com.br,www.faquiz.com.br}"
PRIMARY_DOMAIN="${DOMAINS%%,*}"
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

reload_nginx_best_effort() {
  # Recarrega o nginx (melhor esforço). Se não houver docker cli, não falha.
  if command -v docker >/dev/null 2>&1; then
    docker kill -s HUP "$NGINX_CONTAINER_NAME" >/dev/null 2>&1 || true
  else
    echo "docker CLI não disponível no container certbot; pulei reload do nginx."
  fi
}

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
  if certbot certonly \
    --webroot -w /var/www/certbot \
    --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email \
    $domain_args; then
    echo "Certificado emitido com sucesso."
    echo "Recarregando nginx ($NGINX_CONTAINER_NAME) após emissão inicial"
    reload_nginx_best_effort
    return 0
  fi

  echo "Falha ao emitir certificado inicial. Vou tentar novamente mais tarde (container continua rodando)."
  return 1
}

renew_forever() {
  while :; do
    # Tenta emitir cert inicial caso ainda não exista.
    if ! [ -f "$LIVE_DIR/fullchain.pem" ] || ! [ -f "$LIVE_DIR/privkey.pem" ]; then
      issue_cert_if_missing || true
    fi

    echo "Renovando certificados (se necessário)..."
    certbot renew --webroot -w /var/www/certbot --quiet || true
    reload_nginx_best_effort
    sleep 12h
  done
}

issue_cert_if_missing || true
renew_forever

