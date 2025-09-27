import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { RussianContentSection } from '@/components/ui/russian-content-section';

export default function RussianCinema() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <>
      <SEOHead 
        title="Российское кино - современные фильмы и сериалы | VION"
        description="Лучшие российские фильмы, сериалы и документальные фильмы. Новинки российского кино 2024-2025, топ фильмов по рейтингу, классика и современные российские продюсерские компании."
        keywords="российское кино, русские фильмы, российские сериалы, новинки кино 2024, российские режиссеры, кинопоиск"
      />
      
      <Header 
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-primary">
            Российское кино
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Откройте для себя лучшие российские фильмы, сериалы и документальные фильмы. 
            От последних новинок до классики отечественного кинематографа.
          </p>
        </header>

        <RussianContentSection />
      </main>
      
      <Footer />
    </>
  );
}