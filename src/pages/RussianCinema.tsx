import React from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { RussianContentEnhanced } from '@/components/ui/russian-content-enhanced';

export default function RussianCinema() {
  return (
    <>
      <SEOHead 
        title="Российское кино - современные фильмы и сериалы | VION"
        description="Лучшие российские фильмы, сериалы и документальные фильмы. Новинки российского кино 2024-2025, топ фильмов по рейтингу, классика и современные российские продюсерские компании."
        keywords="российское кино, русские фильмы, российские сериалы, новинки кино 2024, российские режиссеры, кинопоиск"
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

        <RussianContentEnhanced />
      </main>
    </>
  );
}