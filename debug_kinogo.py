#!/usr/bin/env python3
"""
Отладочный скрипт для анализа структуры страницы kinogo
"""

import sys
import os
import requests
from bs4 import BeautifulSoup

# Добавляем путь к модулям
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def debug_kinogo_page():
    """Анализируем структуру страницы kinogo для поиска видео-плееров"""
    
    # Тестовая страница
    test_url = "https://kinogoo.zone/8202-dom-u-dorogi-2024-15-09.html"
    
    print(f"🔍 Анализ страницы: {test_url}")
    print("=" * 60)
    
    # Создаем сессию
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    
    try:
        response = session.get(test_url)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        print(f"✅ Страница загружена, размер: {len(response.content)} байт")
        print()
        
        # Анализируем различные элементы
        print("🎬 ПОИСК ВИДЕО ЭЛЕМЕНТОВ:")
        print("-" * 30)
        
        # 1. iframe элементы
        iframes = soup.find_all('iframe')
        print(f"1. iframe элементов: {len(iframes)}")
        for i, iframe in enumerate(iframes):
            src = iframe.get('src', 'N/A')
            print(f"   iframe {i+1}: {src}")
        print()
        
        # 2. Скрипты с видео
        scripts = soup.find_all('script')
        video_scripts = []
        for script in scripts:
            if script.string:
                content = script.string
                if any(keyword in content.lower() for keyword in ['video', 'player', 'kodik', 'hdvb', 'file:', 'src:']):
                    video_scripts.append(content[:200] + "..." if len(content) > 200 else content)
        
        print(f"2. Скриптов с видео-контентом: {len(video_scripts)}")
        for i, script in enumerate(video_scripts[:3]):  # Показываем только первые 3
            print(f"   Скрипт {i+1}: {script}")
        print()
        
        # 3. Элементы с data-атрибутами
        data_elements = []
        for attr in ['data-src', 'data-file', 'data-player', 'data-video']:
            elements = soup.find_all(attrs={attr: True})
            for elem in elements:
                data_elements.append((attr, elem.get(attr), elem.name))
        
        print(f"3. Элементов с data-атрибутами: {len(data_elements)}")
        for attr, value, tag in data_elements:
            print(f"   {tag}.{attr}: {value}")
        print()
        
        # 4. Ссылки с play в URL
        play_links = []
        for link in soup.find_all('a', href=True):
            href_val = link.get('href')
            if isinstance(href_val, list):
                href = ' '.join(str(x) for x in href_val)
            else:
                href = str(href_val or '')

            if 'play' in href.lower():
                play_links.append((href, link.get_text(strip=True)[:50]))
        
        print(f"4. Ссылок с 'play': {len(play_links)}")
        for href, text in play_links[:5]:
            print(f"   {href} -> '{text}'")
        print()
        
        # 5. Div'ы с классами player/video
        candidate_divs = soup.find_all(['div', 'section'], class_=True)
        player_divs = []
        for div in candidate_divs:
            class_val = div.get('class')
            if class_val is None:
                class_val = []
            if isinstance(class_val, list):
                class_str = ' '.join(str(x) for x in class_val)
            else:
                class_str = str(class_val or '')

            if any(kw in class_str.lower() for kw in ['player', 'video', 'movie']):
                player_divs.append(div)
        print(f"5. Player/video div'ов: {len(player_divs)}")
        for i, div in enumerate(player_divs):
            classes = div.get('class', [])
            print(f"   div {i+1}: classes={classes}")
        print()
        
        # 6. Весь HTML для анализа
        print("📄 ФРАГМЕНТ HTML (первые 1000 символов):")
        print("-" * 40)
        print(response.text[:1000])
        print("...")
        
    except Exception as e:
        print(f"❌ Ошибка загрузки страницы: {e}")

if __name__ == '__main__':
    debug_kinogo_page()