import requests
from bs4 import BeautifulSoup
import time
import json
import logging
import re
import sys
import os

# Делаем корень репозитория импортируемым (если файл запускают как скрипт)
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from parser.models import Movie, create_database, get_session
from parser.utils import (
    clean_text, extract_year, extract_rating, normalize_url,
    get_random_delay, is_valid_movie_url, extract_movie_id,
    format_genre_list
)

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('parser.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class KinogoParser:
    def __init__(self, base_url='https://kinogoo.zone', max_pages=10):
        self.base_url = base_url
        self.max_pages = max_pages
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Инициализация базы данных
        self.engine = create_database()
        self.db_session = get_session(self.engine)
        
        logging.info(f"Парсер инициализирован для {base_url}")

    def get_page(self, url, retries=3):
        """Получает страницу с обработкой ошибок"""
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                response.encoding = response.apparent_encoding
                return response
            except requests.RequestException as e:
                logging.warning(f"Попытка {attempt + 1} не удалась для {url}: {e}")
                if attempt < retries - 1:
                    time.sleep(get_random_delay())
        
        logging.error(f"Не удалось получить страницу: {url}")
        return None

    def parse_main_page(self, page_num=1):
        """Парсит главную страницу и возвращает список URL фильмов"""
        if page_num == 1:
            url = self.base_url
        else:
            url = f"{self.base_url}/page/{page_num}/"
        
        logging.info(f"Парсинг страницы {page_num}: {url}")
        
        response = self.get_page(url)
        if not response:
            return []
        
        soup = BeautifulSoup(response.text, 'html.parser')
        movie_urls = []
        
        # Ищем ссылки на фильмы
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link.get('href')
            full_url = normalize_url(href, self.base_url)
            
            if is_valid_movie_url(full_url):
                movie_urls.append(full_url)
        
        # Убираем дубликаты
        unique_urls = list(set(movie_urls))
        logging.info(f"Найдено {len(unique_urls)} уникальных фильмов на странице {page_num}")
        
        return unique_urls

    def parse_movie_page(self, movie_url):
        """Парсит страницу конкретного фильма"""
        logging.info(f"Парсинг фильма: {movie_url}")
        
        response = self.get_page(movie_url)
        if not response:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Инициализируем данные фильма
        movie_data = {
            'movie_url': movie_url,
            'title': '',
            'original_title': '',
            'year': None,
            'genre': '',
            'description': '',
            'director': '',
            'cast': '',
            'rating_kp': None,
            'rating_imdb': None,
            'quality': '',
            'poster_url': ''
        }
        
        try:
            # Извлекаем заголовок
            title_elem = soup.find('h1') or soup.find('title')
            if title_elem:
                title_text = clean_text(title_elem.get_text())
                movie_data['title'] = title_text
                
                # Извлекаем год из заголовка
                year = extract_year(title_text)
                if year:
                    movie_data['year'] = year
                
                # Убираем год из названия
                clean_title = re.sub(r'\s*\(\d{4}\)', '', title_text)
                movie_data['title'] = clean_title.strip()
            
            # Извлекаем жанры
            genre_elem = soup.find(text=re.compile(r'Жанр:'))
            if genre_elem:
                genre_parent = genre_elem.parent
                if genre_parent:
                    genre_text = clean_text(genre_parent.get_text())
                    genre_text = genre_text.replace('Жанр:', '').strip()
                    genres = format_genre_list(genre_text)
                    movie_data['genre'] = ' / '.join(genres)
            
            # Извлекаем описание
            # Ищем основной текст описания
            description_candidates = []
            
            # Ищем блоки с текстом
            text_blocks = soup.find_all(['p', 'div'])
            for block in text_blocks:
                text = clean_text(block.get_text())
                if len(text) > 100 and 'Жанр:' not in text and 'Режиссер:' not in text:
                    description_candidates.append(text)
            
            if description_candidates:
                # Берем самый длинный блок текста
                movie_data['description'] = max(description_candidates, key=len)[:1000]
            
            # Извлекаем режиссера
            director_elem = soup.find(text=re.compile(r'Режиссер:'))
            if director_elem:
                director_parent = director_elem.parent
                if director_parent:
                    director_text = clean_text(director_parent.get_text())
                    director_text = director_text.replace('Режиссер:', '').strip()
                    movie_data['director'] = director_text
            
            # Извлекаем актеров
            cast_elem = soup.find(text=re.compile(r'В ролях:'))
            if cast_elem:
                cast_parent = cast_elem.parent
                if cast_parent:
                    cast_text = clean_text(cast_parent.get_text())
                    cast_text = cast_text.replace('В ролях:', '').strip()
                    movie_data['cast'] = cast_text
            
            # Извлекаем рейтинги
            rating_text = soup.get_text()
            
            # KinoPoisk рейтинг
            kp_match = re.search(r'KP\s*(\d+\.?\d*)', rating_text)
            if kp_match:
                movie_data['rating_kp'] = extract_rating(kp_match.group(1))
            
            # IMDB рейтинг
            imdb_match = re.search(r'IMDB\s*(\d+\.?\d*)', rating_text)
            if imdb_match:
                movie_data['rating_imdb'] = extract_rating(imdb_match.group(1))
            
            # Извлекаем качество
            quality_match = re.search(r'(HD\s*\d+|TS|CAM|DVD)', rating_text, re.IGNORECASE)
            if quality_match:
                movie_data['quality'] = quality_match.group(1).strip()
            
            # Извлекаем постер
            img_elem = soup.find('img', src=re.compile(r'\.(jpg|jpeg|png|webp)', re.IGNORECASE))
            if img_elem:
                poster_src = img_elem.get('src')
                movie_data['poster_url'] = normalize_url(poster_src, self.base_url)
            
            # Извлекаем ссылки на видео
            video_urls = self.extract_video_urls(soup, movie_url)
            movie_data['video_urls'] = json.dumps(video_urls) if video_urls else None
            
            logging.info(f"Успешно спарсен фильм: {movie_data['title']}")
            return movie_data
            
        except Exception as e:
            logging.error(f"Ошибка при парсинге {movie_url}: {e}")
            return None

    def extract_video_urls(self, soup, movie_url):
        """Извлекает ссылки на видеофайлы"""
        video_urls = []
        
        try:
            # Ищем различные типы плееров и ссылок
            
            # 1. Iframe плееры
            iframes = soup.find_all('iframe')
            for iframe in iframes:
                src = iframe.get('src') or iframe.get('data-src')
                # Игнорируем пустые картинки-заглушки
                ignore_srcs = [
                    'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAEALAAAAAABAAEAAAICTAEAOw==',
                    None,
                    ''
                ]
                
                if src and src not in ignore_srcs:
                    # Проверяем различные плееры
                    if any(domain in src for domain in ['kodik', 'hdvb', 'trailer', 'youtube', 'vk', 'namy.ws', 'embed']):
                        video_urls.append({
                            'type': 'iframe',
                            'url': normalize_url(src, self.base_url),
                            'quality': 'HD',
                            'source': self.get_video_source(src)
                        })
            
            # 2. JavaScript плееры (поиск в скриптах)
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string:
                    script_content = script.string
                    
                    # Ищем ссылки на видео в JS
                    video_patterns = [
                        r'file:\s*["\']([^"\']+\.(?:mp4|m3u8|avi|mkv))["\']',
                        r'src:\s*["\']([^"\']+\.(?:mp4|m3u8|avi|mkv))["\']',
                        r'["\']([^"\']*\/[^"\']*\.(?:mp4|m3u8|avi|mkv))["\']'
                    ]
                    
                    for pattern in video_patterns:
                        matches = re.findall(pattern, script_content, re.IGNORECASE)
                        for match in matches:
                            if match and 'http' in match:
                                video_urls.append({
                                    'type': 'direct',
                                    'url': match,
                                    'quality': self.detect_quality(match),
                                    'source': 'direct'
                                })
            
            # 3. Ссылки в атрибутах data-*
            video_elements = list(soup.find_all(attrs={'data-src': True}))
            video_elements.extend(list(soup.find_all(attrs={'data-file': True})))
            
            for element in video_elements:
                data_src = element.get('data-src') or element.get('data-file')
                if data_src and any(ext in data_src for ext in ['.mp4', '.m3u8', '.avi']):
                    video_urls.append({
                        'type': 'data',
                        'url': normalize_url(data_src, self.base_url),
                        'quality': self.detect_quality(data_src),
                        'source': 'data-attr'
                    })
            
            # 4. Поиск плееров по классам
            player_divs = soup.find_all(['div', 'section'], class_=re.compile(r'player|video|movie', re.I))
            for div in player_divs:
                # Ищем вложенные ссылки
                links = div.find_all('a', href=True)
                for link in links:
                    href = link.get('href')
                    if href and 'play' in href.lower():
                        video_urls.append({
                            'type': 'player_link',
                            'url': normalize_url(href, self.base_url),
                            'quality': 'HD',
                            'source': 'player'
                        })
            
            # Удаляем дубликаты
            seen = set()
            unique_urls = []
            for video in video_urls:
                if video['url'] not in seen:
                    seen.add(video['url'])
                    unique_urls.append(video)
            
            logging.info(f"Найдено {len(unique_urls)} видео ссылок для {movie_url}")
            return unique_urls[:5]  # Ограничиваем количество
            
        except Exception as e:
            logging.error(f"Ошибка при извлечении видео: {e}")
            return []

    def get_video_source(self, url):
        """Определяет источник видео по URL"""
        if 'kodik' in url:
            return 'Kodik'
        elif 'hdvb' in url:
            return 'HDVB'
        elif 'youtube' in url:
            return 'YouTube'
        elif 'vk.com' in url:
            return 'VK Video'
        elif 'namy.ws' in url:
            return 'Namy Player'
        elif 'trailer' in url:
            return 'Trailer'
        elif 'embed' in url:
            return 'Embed Player'
        else:
            return 'Unknown'

    def detect_quality(self, url):
        """Определяет качество видео по URL"""
        url_lower = url.lower()
        if '1080' in url_lower or 'fhd' in url_lower:
            return '1080p'
        elif '720' in url_lower or 'hd' in url_lower:
            return '720p'
        elif '480' in url_lower:
            return '480p'
        elif '360' in url_lower:
            return '360p'
        else:
            return 'HD'

    def save_movie(self, movie_data):
        """Сохраняет фильм в базу данных"""
        try:
            # Проверяем, существует ли уже фильм
            existing_movie = self.db_session.query(Movie).filter_by(
                movie_url=movie_data['movie_url']
            ).first()
            
            if existing_movie:
                logging.info(f"Фильм уже существует: {movie_data['title']}")
                return existing_movie
            
            # Создаем новый объект фильма
            movie = Movie(**movie_data)
            
            # Добавляем в сессию и сохраняем
            self.db_session.add(movie)
            self.db_session.commit()
            
            logging.info(f"Фильм сохранен в БД: {movie_data['title']}")
            return movie
            
        except Exception as e:
            logging.error(f"Ошибка при сохранении фильма: {e}")
            self.db_session.rollback()
            return None

    def run_parser(self):
        """Запускает парсер"""
        logging.info("Начинаем парсинг...")
        
        total_movies = 0
        
        for page_num in range(1, self.max_pages + 1):
            try:
                movie_urls = self.parse_main_page(page_num)
                
                if not movie_urls:
                    logging.warning(f"Не найдено фильмов на странице {page_num}")
                    continue
                
                for movie_url in movie_urls:
                    try:
                        # Проверяем, не парсили ли уже этот фильм
                        if self.db_session.query(Movie).filter_by(movie_url=movie_url).first():
                            continue
                        
                        movie_data = self.parse_movie_page(movie_url)
                        
                        if movie_data:
                            saved_movie = self.save_movie(movie_data)
                            if saved_movie:
                                total_movies += 1
                        
                        # Задержка между запросами
                        time.sleep(get_random_delay())
                        
                    except Exception as e:
                        logging.error(f"Ошибка при обработке {movie_url}: {e}")
                        continue
                
                # Задержка между страницами
                time.sleep(get_random_delay() * 2)
                
            except Exception as e:
                logging.error(f"Ошибка при парсинге страницы {page_num}: {e}")
                continue
        
        logging.info(f"Парсинг завершен. Всего обработано фильмов: {total_movies}")
        self.db_session.close()

def main():
    """Главная функция"""
    print("🎬 Kinogo Parser v1.0")
    print("=" * 50)
    
    # Создаем парсер
    parser = KinogoParser(max_pages=5)  # Парсим первые 5 страниц
    
    try:
        parser.run_parser()
    except KeyboardInterrupt:
        print("\n⛔ Парсинг остановлен пользователем")
    except Exception as e:
        logging.error(f"Критическая ошибка: {e}")
    finally:
        parser.db_session.close()

if __name__ == "__main__":
    main()