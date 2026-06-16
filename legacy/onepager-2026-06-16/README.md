# Путь к человеку

Самостоятельный интерактивный HTML: временная шкала от ранней жизни до Homo sapiens.

Файл `index.html` можно открыть напрямую двойным кликом или через `file://`: CSS, JavaScript и данные встроены внутрь.

## Локальный запуск

```bash
cd evolution-atlas
python3 -m http.server 5178
```

Откройте:

```text
http://localhost:5178
```

## Домашний компьютер через туннель

Сайт является статической папкой. Его можно отдать через Caddy, nginx, Python static server, Cloudflare Tunnel, Tailscale Funnel или ngrok.

Пример с Python и Cloudflare Tunnel:

```bash
cd evolution-atlas
python3 -m http.server 5178
cloudflared tunnel --url http://localhost:5178
```

## Мобильные устройства

Для iPhone и Android надежнее открывать сайт по HTTP/HTTPS URL через домашний сервер или туннель. На компьютере можно открывать `index.html` напрямую.
