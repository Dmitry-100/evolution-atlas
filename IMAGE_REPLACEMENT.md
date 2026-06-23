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
- `public/assets/images/source-backed/generated-atlas/` — массовые AI-реконструкции для основной линии Атласа.
- `public/assets/images/dinosaurs/generated-branch/` — массовые AI-реконструкции для ветки “динозавры → птицы”.
- `public/assets/images/source-backed/generated-early-chordates.png` — ранние хордовые.
- `public/assets/images/source-backed/generated-amniote-common-ancestor.png` — ранние амниоты / общий предок с птицами.
- `public/assets/images/source-backed/generated-homo-sapiens.jpg` — Homo sapiens.
- `public/assets/images/dinosaurs/generated-early-dinosaurs.png` — ранние динозавры.

## Основной Атлас: имена файлов для массовой замены

Если нужно обновить весь визуальный ряд основной шкалы, кладите новые изображения в `public/assets/images/source-backed/generated-atlas/` с такими именами:

- `prokaryotes.jpg`
- `cyanobacteria.jpg`
- `eukaryotes.jpg`
- `choanoflagellates.jpg`
- `early-animals.jpg`
- `bilaterians.jpg`
- `early-chordates.jpg`
- `early-vertebrates.jpg`
- `jawed-fish.jpg`
- `lobe-finned.jpg`
- `tiktaalik.jpg`
- `early-tetrapods.jpg`
- `synapsids.jpg`
- `therapsids.jpg`
- `cynodonts.jpg`
- `early-mammals.jpg`
- `early-eutherians.jpg`
- `after-kpg.jpg`
- `early-primates.jpg`
- `ancient-primates.jpg`
- `new-world-monkeys.jpg`
- `old-world-monkeys.jpg`
- `catarrhini.jpg`
- `early-apes.jpg`
- `great-apes.jpg`

## Динозавры: имена файлов для массовой замены

Ветка “динозавры → птицы” берет новые изображения из `public/assets/images/dinosaurs/generated-branch/`:

- `diapsids.jpg`
- `archosaurs.jpg`
- `theropods.jpg`
- `feathered-dinosaurs.jpg`
- `archaeopteryx.jpg`
- `early-birds.jpg`
- `kpg-survivors.jpg`
- `modern-birds.jpg`

Для этапа “Ранние динозавры” пока используется отдельный слот `public/assets/images/dinosaurs/generated-early-dinosaurs.png`; если появится новая картинка, проще заменить этот файл тем же именем.

## Глобальные вымирания: имена файлов для замены

Страница “Глобальные вымирания” берет вертикальные изображения из `public/assets/images/extinctions/portrait/`. Эти файлы используются только на странице `/extinctions`; остальные разделы берут горизонтальные изображения из `public/assets/images/extinctions/`. Кладите новые JPG с теми же именами:

- `ordovician-silurian.jpg`
- `late-devonian.jpg`
- `permian-triassic.jpg`
- `triassic-jurassic.jpg`
- `cretaceous-paleogene.jpg`
- `holocene-anthropocene.jpg`

Промпты для всех шести сцен лежат в `docs/extinction-image-prompts.md`. После замены JPG обновите AVIF-пары командой:

```bash
node scripts/optimize-images.mjs public/assets/images/extinctions/<file-name>.jpg
```

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
