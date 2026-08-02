from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path("/Users/Sotnikov/code/evolution-atlas")
SCREENSHOTS = ROOT / "output/playwright/seo-comparison"
OUTPUT = ROOT / "output/pdf/Evolution_Atlas_SEO_before_after.pdf"

PAGE_W, PAGE_H = landscape(A4)
MARGIN = 32

INK = HexColor("#171915")
MUTED = HexColor("#666B63")
PAPER = HexColor("#F5F1E8")
CARD = HexColor("#FFFDF8")
CURRENT_BG = HexColor("#E9E7E1")
PROPOSED_BG = HexColor("#F6E8BF")
GOLD = HexColor("#C6932D")
GOLD_DARK = HexColor("#795613")
DARK = HexColor("#090C0B")
GREEN = HexColor("#12372D")
LINE = HexColor("#CFC8B8")


pdfmetrics.registerFont(
    TTFont("Arial", "/System/Library/Fonts/Supplemental/Arial.ttf")
)
pdfmetrics.registerFont(
    TTFont("Arial-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf")
)
pdfmetrics.registerFont(
    TTFont("Georgia", "/System/Library/Fonts/Supplemental/Georgia.ttf")
)
pdfmetrics.registerFont(
    TTFont("Georgia-Bold", "/System/Library/Fonts/Supplemental/Georgia Bold.ttf")
)


STYLES = {
    "body": ParagraphStyle(
        "body",
        fontName="Arial",
        fontSize=8.4,
        leading=11,
        textColor=INK,
        alignment=TA_LEFT,
    ),
    "small": ParagraphStyle(
        "small",
        fontName="Arial",
        fontSize=7.2,
        leading=9.2,
        textColor=MUTED,
        alignment=TA_LEFT,
    ),
    "label": ParagraphStyle(
        "label",
        fontName="Arial-Bold",
        fontSize=7.1,
        leading=8.5,
        textColor=GOLD_DARK,
        alignment=TA_LEFT,
    ),
    "compare": ParagraphStyle(
        "compare",
        fontName="Arial",
        fontSize=6.8,
        leading=8.1,
        textColor=INK,
        alignment=TA_LEFT,
    ),
    "compare_label": ParagraphStyle(
        "compare_label",
        fontName="Arial-Bold",
        fontSize=6.2,
        leading=7,
        textColor=GOLD_DARK,
        alignment=TA_LEFT,
    ),
    "card_title": ParagraphStyle(
        "card_title",
        fontName="Georgia-Bold",
        fontSize=13,
        leading=15,
        textColor=INK,
        alignment=TA_LEFT,
    ),
}


PAGES = [
    {
        "slug": "home",
        "route": "/",
        "name": "Главная: история жизни",
        "purpose": "Широкий поисковый кластер о развитии жизни на Земле",
        "current": {
            "seo": "Достающее звено - интерактивный атлас эволюции",
            "h1": "Человек произошел от обезьяны... а от кого произошла обезьяна?",
            "intro": "Почти вся история жизни прошла до появления приматов. Перемещайтесь по шкале, чтобы увидеть, как клеточные линии, рыбы, четвероногие, млекопитающие и древние приматы связаны с нашей ветвью.",
        },
        "proposed": {
            "seo": "Эволюция жизни на Земле: интерактивная шкала | Достающее звено",
            "h1": "Эволюция жизни на Земле: от первых клеток до человека",
            "intro": "Проследите ключевые этапы: от древних клеточных линий и первых животных до позвоночных, млекопитающих, приматов и Homo sapiens.",
        },
        "structure": [
            "Вопрос про обезьяну сохранить как заметную ссылку на /primates.",
            "Добавить H2: «Хронология эволюции жизни на Земле».",
            "Дать короткое текстовое содержание интерактивной шкалы.",
        ],
        "unchanged": "Дизайн, интерактивная шкала, карточки фактов, изображения и навигация.",
    },
    {
        "slug": "primates",
        "route": "/primates",
        "name": "Приматы: происхождение человека",
        "purpose": "Этапы эволюции человека и общий предок с другими приматами",
        "current": {
            "seo": "Эволюция приматов и человека | Достающее звено",
            "h1": "Приматы -> человек",
            "intro": "Здесь собраны антропоиды, человекообразные, гоминины, ранние Homo, соседние человеческие линии и первые следы расселения.",
        },
        "proposed": {
            "seo": "Эволюция человека: этапы и общий предок с обезьянами",
            "h1": "Эволюция человека: от ранних приматов до Homo sapiens",
            "intro": "Человек не произошел от современной обезьяны. Люди и другие приматы унаследовали признаки от общих предков, а затем их ветви развивались независимо.",
        },
        "structure": [
            "Добавить H2: «Этапы эволюции человека в хронологическом порядке».",
            "Добавить блок: «Кто был общим предком человека и обезьян?».",
            "Явно показать, что это ветвящееся дерево, а не линейная лестница.",
        ],
        "unchanged": "Интерактивная ось, карта Африки, этапы ветви и существующие источники.",
    },
    {
        "slug": "theory",
        "route": "/theory",
        "name": "Теория эволюции",
        "purpose": "Почему это теория, доказана ли она и чем подтверждается",
        "current": {
            "seo": "Почему эволюция - научная теория | Достающее звено",
            "h1": "Почему эволюция называется теорией",
            "intro": "В бытовой речи «теория» часто звучит как предположение. В науке это слово означает проверяемое объяснение, которое связывает факты и делает предсказания.",
        },
        "proposed": {
            "seo": "Почему эволюция - научная теория | Достающее звено",
            "h1": "Почему эволюция называется теорией",
            "intro": "В науке теория - не догадка, а проверяемая система объяснений. Эволюцию подтверждают ископаемые, ДНК, анатомия, биогеография и наблюдаемые изменения популяций.",
        },
        "structure": [
            "H1 и SEO title оставить: они уже хорошо соответствуют запросу.",
            "Добавить H2: «Какие доказательства подтверждают эволюцию».",
            "Добавить четыре коротких ответа на частые вопросы.",
        ],
        "unchanged": "Карточки принципов, блок Дарвина, доказательства и научные источники.",
    },
    {
        "slug": "origin-of-life",
        "route": "/origin-of-life",
        "name": "Происхождение жизни",
        "purpose": "Как появилась жизнь и какие научные гипотезы это объясняют",
        "current": {
            "seo": "Гипотезы зарождения жизни | Достающее звено",
            "h1": "Гипотезы зарождения жизни",
            "intro": "Теория эволюции объясняет, как меняются уже живые системы. Вопрос «как химия стала жизнью?» изучает абиогенез.",
        },
        "proposed": {
            "seo": "Происхождение жизни на Земле: научные гипотезы",
            "h1": "Как появилась жизнь на Земле: основные научные гипотезы",
            "intro": "Наука пока не знает единственного завершенного сценария. Абиогенез исследует, как неживая химия могла перейти к молекулам, мембранам, наследованию и первым клеточным системам.",
        },
        "structure": [
            "Добавить H2: «Что такое абиогенез».",
            "Добавить H2: «Основные гипотезы происхождения жизни».",
            "Назвать блок: «Гипотеза мира РНК простыми словами».",
        ],
        "unchanged": "Цепочка переходов, карточки гипотез, LUCA, иллюстрации и источники.",
    },
    {
        "slug": "genetics",
        "route": "/genetics",
        "name": "Генетические доказательства",
        "purpose": "Как ДНК подтверждает эволюцию и общее происхождение",
        "current": {
            "seo": "РНК, ДНК и доказательства родства | Достающее звено",
            "h1": "РНК/ДНК: родство записано в коде",
            "intro": "Современная молекулярная генетика объясняет эволюцию через наследование, мутации, общий генетический код и сравнение последовательностей.",
        },
        "proposed": {
            "seo": "Генетические доказательства эволюции: ДНК и хромосома 2",
            "h1": "Как ДНК подтверждает эволюцию и общее происхождение",
            "intro": "Общий генетический код, сходство последовательностей, хромосома 2 и редкие вирусные вставки сохраняют историю родства. Молекулярные данные складываются в то же дерево, что ископаемые и анатомия.",
        },
        "structure": [
            "Добавить H2: «Молекулярно-генетические доказательства эволюции».",
            "Добавить H2 о сходстве ДНК человека и шимпанзе.",
            "Добавить H2 о 46 и 48 хромосомах.",
        ],
        "unchanged": "Сравнение геномов, кодоны, хромосома 2, вирусные вставки и источники.",
    },
]


QUERY_GROUPS = [
    (
        "Главная /",
        [
            "эволюция жизни на Земле",
            "история развития жизни на Земле",
            "эволюция жизни на Земле кратко",
            "хронология эволюции жизни на Земле",
        ],
    ),
    (
        "Приматы /primates",
        [
            "этапы эволюции человека",
            "человек произошел от обезьяны или нет",
            "общий предок человека и обезьяны",
            "предки человека в хронологическом порядке",
        ],
    ),
    (
        "Теория /theory",
        [
            "почему теория эволюции называется теорией",
            "теория эволюции кратко и понятно",
            "доказательства эволюции кратко",
            "теория эволюции доказана или нет",
        ],
    ),
    (
        "Жизнь /origin-of-life",
        [
            "происхождение жизни на Земле",
            "как появилась жизнь на Земле кратко",
            "гипотезы происхождения жизни на Земле",
            "гипотеза мира РНК простыми словами",
        ],
    ),
    (
        "Генетика /genetics",
        [
            "генетические доказательства эволюции",
            "молекулярно-генетические доказательства эволюции",
            "сходство ДНК человека и шимпанзе в процентах",
            "почему у человека 46 хромосом, а у обезьян 48",
        ],
    ),
]


def page_background(c: canvas.Canvas, color=PAPER) -> None:
    c.setFillColor(color)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)


def para(c: canvas.Canvas, text: str, x: float, y_top: float, width: float, style: str) -> float:
    p = Paragraph(text, STYLES[style])
    _, height = p.wrap(width, PAGE_H)
    p.drawOn(c, x, y_top - height)
    return height


def round_rect(c: canvas.Canvas, x: float, y: float, w: float, h: float, fill, stroke=LINE, radius=9) -> None:
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(0.7)
    c.roundRect(x, y, w, h, radius, stroke=1, fill=1)


def footer(c: canvas.Canvas, page_num: int, label: str = "SEO-рекомендации - 3 августа 2026") -> None:
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(MARGIN, 22, PAGE_W - MARGIN, 22)
    c.setFont("Arial", 7)
    c.setFillColor(MUTED)
    c.drawString(MARGIN, 10, label)
    c.drawRightString(PAGE_W - MARGIN, 10, str(page_num))


def header(c: canvas.Canvas, kicker: str, title: str, subtitle: str = "") -> None:
    c.setFillColor(GOLD_DARK)
    c.setFont("Arial-Bold", 8)
    c.drawString(MARGIN, PAGE_H - 34, kicker.upper())
    c.setFillColor(INK)
    c.setFont("Georgia-Bold", 22)
    c.drawString(MARGIN, PAGE_H - 62, title)
    if subtitle:
        c.setFont("Arial", 8.5)
        c.setFillColor(MUTED)
        c.drawString(MARGIN, PAGE_H - 78, subtitle)


def comparison_column(c: canvas.Canvas, x: float, y: float, w: float, h: float, label: str, data: dict, proposed: bool) -> None:
    fill = PROPOSED_BG if proposed else CURRENT_BG
    round_rect(c, x, y, w, h, fill)
    c.setFillColor(GOLD_DARK if proposed else MUTED)
    c.setFont("Arial-Bold", 8)
    c.drawString(x + 12, y + h - 18, label.upper())

    line_y = y + h - 31
    for field, value in [("SEO TITLE", data["seo"]), ("H1", data["h1"]), ("ВВОДНЫЙ ТЕКСТ", data["intro"])]:
        label_height = para(c, field, x + 12, line_y, w - 24, "compare_label")
        line_y -= label_height + 1
        used = para(c, value, x + 12, line_y, w - 24, "compare")
        line_y -= used + 3


def draw_screenshot(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float) -> None:
    round_rect(c, x - 2, y - 2, w + 4, h + 4, white, LINE, radius=7)
    image = ImageReader(str(path))
    c.drawImage(image, x, y, width=w, height=h, preserveAspectRatio=True, anchor="c", mask="auto")


def checkbox_row(c: canvas.Canvas, x: float, y: float) -> None:
    c.setFillColor(MUTED)
    c.setFont("Arial", 7.5)
    labels = ["Принять", "Скорректировать", "Оставить как сейчас"]
    cursor = x
    for label in labels:
        c.setStrokeColor(MUTED)
        c.rect(cursor, y, 8, 8, stroke=1, fill=0)
        c.drawString(cursor + 12, y + 0.5, label)
        cursor += 90 if label != labels[-1] else 120


def cover_page(c: canvas.Canvas) -> None:
    page_background(c, DARK)
    c.setStrokeColor(GOLD)
    c.setFillColor(GOLD)
    c.circle(74, PAGE_H - 78, 28, stroke=1, fill=0)
    c.circle(74, PAGE_H - 78, 17, stroke=1, fill=0)
    c.line(52, PAGE_H - 78, 96, PAGE_H - 78)
    c.line(74, PAGE_H - 100, 74, PAGE_H - 56)

    c.setFillColor(HexColor("#E4B556"))
    c.setFont("Arial-Bold", 10)
    c.drawString(MARGIN, PAGE_H - 142, "EVOLUTION ATLAS / ДОСТАЮЩЕЕ ЗВЕНО")
    c.setFillColor(HexColor("#F4EEDC"))
    c.setFont("Georgia-Bold", 32)
    c.drawString(MARGIN, PAGE_H - 190, "SEO: как сейчас и что предлагается")
    c.setFont("Arial", 13)
    c.setFillColor(HexColor("#C8C3B7"))
    c.drawString(MARGIN, PAGE_H - 218, "Пять страниц, 20 поисковых вопросов и визуальное сравнение")

    round_rect(c, MARGIN, 118, PAGE_W - 2 * MARGIN, 135, HexColor("#111715"), HexColor("#4B442C"), radius=14)
    c.setFillColor(HexColor("#F4EEDC"))
    c.setFont("Georgia-Bold", 15)
    c.drawString(MARGIN + 20, 225, "Что находится в документе")
    items = [
        "Точные пары SEO title, H1 и первого абзаца: сейчас -> предлагается.",
        "Скриншоты production и браузерных макетов в одинаковом разрешении 1440 x 900.",
        "Дополнительные H2 и структурные изменения для каждого раздела.",
        "Отдельное пояснение технического prerender без видимых изменений дизайна.",
    ]
    y = 201
    c.setFont("Arial", 10)
    c.setFillColor(HexColor("#D6D1C5"))
    for item in items:
        c.setFillColor(GOLD)
        c.circle(MARGIN + 23, y + 2, 2.5, stroke=0, fill=1)
        c.setFillColor(HexColor("#D6D1C5"))
        c.drawString(MARGIN + 34, y - 2, item)
        y -= 25

    c.setFont("Arial-Bold", 9)
    c.setFillColor(GOLD)
    c.drawString(MARGIN, 77, "ВАЖНО")
    c.setFont("Arial", 9)
    c.setFillColor(HexColor("#C8C3B7"))
    c.drawString(MARGIN + 55, 77, "Портал и репозиторий не изменялись. «Предлагается» - временная подмена текста только в браузере.")
    c.setFont("Arial", 8)
    c.drawRightString(PAGE_W - MARGIN, 38, "3 августа 2026")
    c.showPage()


def query_page(c: canvas.Canvas, page_num: int) -> None:
    page_background(c)
    header(c, "Карта спроса", "20 поисковых вопросов", "Формулировки сгруппированы по странице, которая должна отвечать на запрос")

    card_w = (PAGE_W - 2 * MARGIN - 18) / 2
    card_h = 126
    positions = [
        (MARGIN, 337),
        (MARGIN + card_w + 18, 337),
        (MARGIN, 193),
        (MARGIN + card_w + 18, 193),
        (MARGIN, 55),
    ]
    for index, ((title, queries), (x, y)) in enumerate(zip(QUERY_GROUPS, positions), start=1):
        width = PAGE_W - 2 * MARGIN if index == 5 else card_w
        round_rect(c, x, y, width, card_h, CARD)
        c.setFillColor(GOLD)
        c.setFont("Arial-Bold", 9)
        c.drawString(x + 14, y + card_h - 22, f"0{index}")
        c.setFillColor(INK)
        c.setFont("Georgia-Bold", 12)
        c.drawString(x + 40, y + card_h - 24, title)
        line_y = y + card_h - 48
        for query_index, query in enumerate(queries, start=1):
            c.setFillColor(MUTED)
            c.setFont("Arial", 8.2)
            c.drawString(x + 16, line_y, f"{query_index}. {query}")
            line_y -= 18

    c.setFillColor(MUTED)
    c.setFont("Arial", 7)
    c.drawRightString(PAGE_W - MARGIN, 36, "Точные частотности уточняются после накопления данных Яндекс Вебмастера.")
    footer(c, page_num)
    c.showPage()


def detail_page(c: canvas.Canvas, page_num: int, data: dict) -> None:
    page_background(c)
    header(c, f"Страница {data['route']}", data["name"], data["purpose"])

    gap = 16
    col_w = (PAGE_W - 2 * MARGIN - gap) / 2
    compare_y = 357
    compare_h = 126
    comparison_column(c, MARGIN, compare_y, col_w, compare_h, "Как сейчас", data["current"], False)
    comparison_column(c, MARGIN + col_w + gap, compare_y, col_w, compare_h, "Предлагается", data["proposed"], True)

    image_y = 119
    image_h = 218
    image_w = col_w
    draw_screenshot(c, SCREENSHOTS / f"current-{data['slug']}.png", MARGIN, image_y, image_w, image_h)
    draw_screenshot(c, SCREENSHOTS / f"proposed-{data['slug']}.png", MARGIN + col_w + gap, image_y, image_w, image_h)

    c.setFillColor(MUTED)
    c.setFont("Arial-Bold", 7.4)
    c.drawString(MARGIN + 6, image_y + image_h + 8, "PRODUCTION - СЕЙЧАС")
    c.setFillColor(GOLD_DARK)
    c.drawString(MARGIN + col_w + gap + 6, image_y + image_h + 8, "БРАУЗЕРНЫЙ МАКЕТ - ПРЕДЛАГАЕТСЯ")

    bottom_y = 37
    bottom_h = 66
    round_rect(c, MARGIN, bottom_y, PAGE_W - 2 * MARGIN, bottom_h, CARD)
    c.setFillColor(INK)
    c.setFont("Arial-Bold", 8)
    c.drawString(MARGIN + 12, bottom_y + bottom_h - 17, "СТРУКТУРНЫЕ ИЗМЕНЕНИЯ")
    line_y = bottom_y + bottom_h - 31
    for item in data["structure"]:
        c.setFillColor(GOLD)
        c.circle(MARGIN + 16, line_y + 2, 1.7, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont("Arial", 7.2)
        c.drawString(MARGIN + 24, line_y, item)
        line_y -= 11

    c.setFillColor(GREEN)
    c.setFont("Arial-Bold", 7.2)
    c.drawString(PAGE_W / 2 + 45, bottom_y + bottom_h - 17, "БЕЗ ИЗМЕНЕНИЙ")
    para(c, data["unchanged"], PAGE_W / 2 + 45, bottom_y + bottom_h - 27, 310, "small")
    checkbox_row(c, PAGE_W / 2 + 45, bottom_y + 9)

    footer(c, page_num)
    c.showPage()


def technical_page(c: canvas.Canvas, page_num: int) -> None:
    page_background(c)
    header(c, "Общее решение", "Что изменится кроме видимого текста", "Техническая часть усиливает индексируемый HTML и не меняет интерфейс после загрузки React")

    left_x = MARGIN
    right_x = PAGE_W / 2 + 8
    card_w = PAGE_W / 2 - MARGIN - 16
    round_rect(c, left_x, 267, card_w, 210, CURRENT_BG)
    round_rect(c, right_x, 267, card_w, 210, PROPOSED_BG)

    c.setFillColor(MUTED)
    c.setFont("Arial-Bold", 9)
    c.drawString(left_x + 16, 452, "СЕЙЧАС: PRERENDER")
    c.setFillColor(INK)
    c.setFont("Georgia-Bold", 15)
    c.drawString(left_x + 16, 424, "Минимальный HTML")
    current_items = ["H1", "SEO description", "Ссылки навигации"]
    y = 390
    for item in current_items:
        c.setFillColor(MUTED)
        c.circle(left_x + 21, y + 2, 2, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont("Arial", 9)
        c.drawString(left_x + 31, y - 1, item)
        y -= 25
    para(c, "Основной содержательный текст появляется после выполнения JavaScript.", left_x + 16, 300, card_w - 32, "body")

    c.setFillColor(GOLD_DARK)
    c.setFont("Arial-Bold", 9)
    c.drawString(right_x + 16, 452, "ПРЕДЛАГАЕТСЯ: РАСШИРЕННЫЙ PRERENDER")
    c.setFillColor(INK)
    c.setFont("Georgia-Bold", 15)
    c.drawString(right_x + 16, 424, "Содержательный HTML")
    proposed_items = ["H1 и прямой ответ", "Основные H2", "Короткие выводы", "Контекстные внутренние ссылки"]
    y = 390
    for item in proposed_items:
        c.setFillColor(GOLD)
        c.circle(right_x + 21, y + 2, 2, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont("Arial", 9)
        c.drawString(right_x + 31, y - 1, item)
        y -= 25
    para(c, "После запуска React пользователь видит тот же интерфейс, который показан на макетах.", right_x + 16, 299, card_w - 32, "body")

    round_rect(c, MARGIN, 92, PAGE_W - 2 * MARGIN, 160, CARD)
    c.setFillColor(INK)
    c.setFont("Georgia-Bold", 15)
    c.drawString(MARGIN + 16, 224, "Рекомендуемая последовательность внедрения")
    steps = [
        "1. Развести главную и /primates по разным поисковым намерениям.",
        "2. Обновить SEO title, H1 и первые абзацы после согласования формулировок.",
        "3. Добавить вопросные H2 без переписывания существующих научных карточек.",
        "4. Расширить prerender этих пяти маршрутов.",
        "5. После индексации сравнивать показы, CTR и переходы по целям Метрики.",
    ]
    y = 195
    for step in steps:
        c.setFillColor(GOLD)
        c.circle(MARGIN + 21, y + 2, 2, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont("Arial", 8.8)
        c.drawString(MARGIN + 32, y - 1, step)
        y -= 23

    c.setFillColor(GOLD_DARK)
    c.setFont("Arial-Bold", 8)
    c.drawRightString(PAGE_W - MARGIN - 16, 110, "Решение по пакету")
    checkbox_row(c, PAGE_W - MARGIN - 292, 97)
    footer(c, page_num)
    c.showPage()


def build() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=landscape(A4))
    c.setTitle("Evolution Atlas SEO: как сейчас и что предлагается")
    c.setAuthor("Codex")
    c.setSubject("Сравнение SEO-заголовков и визуальных макетов пяти страниц")

    cover_page(c)
    query_page(c, 2)
    for page_num, data in enumerate(PAGES, start=3):
        detail_page(c, page_num, data)
    technical_page(c, 8)
    c.save()


if __name__ == "__main__":
    build()
    print(OUTPUT)
