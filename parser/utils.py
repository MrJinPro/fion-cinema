from __future__ import annotations

import html
import random
import re
from typing import Iterable, List, Optional
from urllib.parse import urljoin, urlparse


_whitespace_re = re.compile(r"\s+")
_year_re = re.compile(r"\b(19\d{2}|20\d{2})\b")


def clean_text(text: object) -> str:
    """Нормализует текст: html-unescape, trim, схлопывание пробелов."""
    if text is None:
        return ""
    value = str(text)
    value = html.unescape(value)
    value = value.replace("\xa0", " ")
    value = _whitespace_re.sub(" ", value)
    return value.strip()


def extract_year(text: object) -> Optional[int]:
    match = _year_re.search(clean_text(text))
    if not match:
        return None
    try:
        return int(match.group(1))
    except ValueError:
        return None


def extract_rating(value: object) -> Optional[float]:
    """Пытается распарсить рейтинг вида 7.4 / 7,4 / '7'."""
    if value is None:
        return None
    text = clean_text(value).replace(",", ".")
    match = re.search(r"(\d+(?:\.\d+)?)", text)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def normalize_url(href: object, base_url: str) -> str:
    """Приводит ссылку к абсолютной относительно base_url."""
    if href is None:
        return ""
    href_text = clean_text(href)
    if not href_text:
        return ""
    return urljoin(base_url.rstrip("/") + "/", href_text)


def get_random_delay(min_delay: float = 1.0, max_delay: float = 3.0) -> float:
    if max_delay < min_delay:
        min_delay, max_delay = max_delay, min_delay
    return random.uniform(min_delay, max_delay)


def is_valid_movie_url(url: object) -> bool:
    """Эвристика: отбрасываем пагинацию/категории и явный мусор."""
    url_text = clean_text(url)
    if not url_text:
        return False

    parsed = urlparse(url_text)
    if not parsed.scheme or not parsed.netloc:
        return False

    path = (parsed.path or "").lower()

    # очевидные не-страницы фильма
    blacklist_parts = [
        "/page/",
        "/tag/",
        "/genre/",
        "/category/",
        "/actor/",
        "/director/",
        "/year/",
        "/series/",
        "/serial/",
        "/feed/",
    ]
    if any(part in path for part in blacklist_parts):
        return False

    # На kinogo/kinogoo часто фильмы имеют .html
    if path.endswith(".html"):
        return True

    # иначе — хотя бы наличие цифр в конце/внутри пути
    return bool(re.search(r"\d{3,}", path))


def extract_movie_id(url: object) -> Optional[str]:
    """Достаёт числовой id из URL, если есть."""
    url_text = clean_text(url)
    if not url_text:
        return None
    match = re.search(r"(\d{3,})", url_text)
    return match.group(1) if match else None


def format_genre_list(genre_text: object) -> List[str]:
    """Нормализует жанры в список строк."""
    text = clean_text(genre_text)
    if not text:
        return []

    # разделители: запятая, слэш, вертикальная черта
    parts = re.split(r"\s*(?:,|/|\|)\s*", text)
    cleaned = [clean_text(p) for p in parts]
    return [p for p in cleaned if p]
