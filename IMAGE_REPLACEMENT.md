# Быстрая замена изображений

Этот проект устроен так, чтобы новые AI-реконструкции можно было быстро подставлять без переделки интерфейса.

## Куда класть новые файлы

- Основной атлас: `public/assets/images/source-backed/`
- Раздел динозавров: `public/assets/images/dinosaurs/`
- Зарождение жизни и РНК/ДНК: `public/assets/images/education/`
- Видео и лекции: `public/assets/images/watch/`
- Фоны временных шкал: `public/assets/images/`

Самый простой способ: заменить файл с тем же именем. Тогда код менять не нужно.

## Стабильные слоты для замены

- `public/assets/images/timeline-river-evolution.jpg` — фон шкалы “Весь путь”.
- `public/assets/images/primate-timeline-river.jpg` — фон шкалы “От обезьян к человеку”.
- `public/assets/images/dinosaurs/dinosaur-timeline-river.png` — фон шкалы динозавров.
- `public/assets/images/source-backed/generated-early-chordates.png` — ранние хордовые.
- `public/assets/images/source-backed/generated-amniote-common-ancestor.png` — ранние амниоты / общий предок с птицами.
- `public/assets/images/source-backed/generated-homo-sapiens.jpg` — Homo sapiens.
- `public/assets/images/dinosaurs/generated-diapsids.png` — диапсиды.
- `public/assets/images/dinosaurs/generated-archosaurs.png` — архозавры.
- `public/assets/images/dinosaurs/generated-early-dinosaurs.png` — ранние динозавры.

## Если нужен новый файл, а не замена старого

1. Положить изображение в подходящую папку.
2. Для основной линии обновить `src/data/sourceImages.ts`.
3. Для динозавровой линии обновить `src/data/dinosaurLineage.ts`.
4. Для образовательных страниц найти текущий путь через `rg "имя-файла" src`.

## Рекомендации для генерации

- Карточки видов: 16:9 или 4:3, объект крупно, темный музейный фон, без текста на изображении.
- Фоны шкал: широкий формат 3:1 или 4:1, слева направо, без подписей, с чистой зоной под точки и всплывающие плашки.
- Схемы РНК/ДНК: можно с текстом, но лучше на русском и с крупными подписями, потому что картинка открывается в увеличенном виде.
- Для слабых или спорных реконструкций лучше ставить `kind: "generated-reconstruction"` и сохранять `promptId`.
