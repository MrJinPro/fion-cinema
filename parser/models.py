from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    original_title = Column(String(255))
    year = Column(Integer)
    genre = Column(String(255))
    description = Column(Text)
    director = Column(String(255))
    cast = Column(Text)  # JSON строка с актерами
    rating_kp = Column(Float)
    rating_imdb = Column(Float)
    quality = Column(String(50))  # HD 1080, TS, etc.
    poster_url = Column(String(500))
    movie_url = Column(String(500), unique=True)
    video_urls = Column(Text)  # JSON строка с видео ссылками
    source_site = Column(String(100))  # Источник парсинга
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Movie {self.title} ({self.year})>"

    def to_dict(self) -> dict:
        """Преобразует объект в словарь для JSON."""
        created_at = getattr(self, "created_at", None)
        updated_at = getattr(self, "updated_at", None)
        return {
            "id": self.id,
            "title": self.title,
            "original_title": self.original_title,
            "year": self.year,
            "genre": self.genre,
            "description": self.description,
            "director": self.director,
            "cast": self.cast,
            "rating_kp": self.rating_kp,
            "rating_imdb": self.rating_imdb,
            "quality": self.quality,
            "poster_url": self.poster_url,
            "movie_url": self.movie_url,
            "video_urls": self.video_urls,
            "source_site": self.source_site,
            "created_at": created_at.isoformat() if isinstance(created_at, datetime) else None,
            "updated_at": updated_at.isoformat() if isinstance(updated_at, datetime) else None,
        }


def create_database(db_path: str = "data/cinema.db"):
    """Создает базу данных и таблицы."""
    engine = create_engine(f"sqlite:///{db_path}", echo=False)
    Base.metadata.create_all(engine)
    return engine


def get_session(engine):
    """Создает сессию для работы с БД."""
    Session = sessionmaker(bind=engine)
    return Session()
