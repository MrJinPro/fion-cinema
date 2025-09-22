import React, { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { 
  Play, 
  Heart, 
  List, 
  Search, 
  Star, 
  Users, 
  Film, 
  Tv, 
  Github, 
  Mail,
  ExternalLink 
} from 'lucide-react';

const About = () => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    // Заглушка для поиска
  };

  const features = [
    {
      icon: Search,
      title: 'Поиск и фильтрация',
      description: 'Мощная система поиска с фильтрами по жанрам, годам, рейтингу и другим параметрам',
      color: 'text-primary'
    },
    {
      icon: Film,
      title: 'База фильмов',
      description: 'Доступ к огромной базе данных фильмов с подробной информацией и трейлерами',
      color: 'text-orange'
    },
    {
      icon: Tv,
      title: 'Сериалы',
      description: 'Информация о сериалах, сезонах и эпизодах с актуальными данными',
      color: 'text-accent'
    },
    {
      icon: Heart,
      title: 'Избранное',
      description: 'Сохраняйте понравившиеся фильмы и сериалы в персональном списке избранного',
      color: 'text-info'
    },
    {
      icon: List,
      title: 'Пользовательские списки',
      description: 'Создавайте собственные тематические списки и коллекции',
      color: 'text-primary'
    },
    {
      icon: Users,
      title: 'Информация об актёрах',
      description: 'Подробная информация об актёрах, режиссёрах и их фильмографии',
      color: 'text-orange'
    }
  ];

  const technologies = [
    'React + TypeScript',
    'Tailwind CSS',
    'Shadcn/ui',
    'TMDb API',
    'IndexedDB',
    'React Query',
    'React Router',
    'Lucide Icons'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />

      <main className="container px-4 py-8">
        {/* Заголовок страницы */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            О проекте ViOn Cinema
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Современный веб-каталог фильмов и сериалов, созданный для любителей кинематографа
          </p>
        </div>

        {/* Описание проекта */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Что такое ViOn?
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  ViOn Cinema — это современный веб-каталог фильмов и сериалов, который предоставляет 
                  пользователям доступ к обширной базе данных кинематографического контента.
                </p>
                <p>
                  Наш проект использует API The Movie Database (TMDb) для получения актуальной 
                  информации о фильмах, сериалах, актёрах и режиссёрах со всего мира.
                </p>
                <p>
                  ViOn создан как некоммерческий образовательный проект и предназначен исключительно 
                  для ознакомления с информацией о кинематографе. Мы не распространяем и не предоставляем 
                  доступ к защищённому авторским правом контенту.
                </p>
              </div>
            </div>
            
            <Card className="bg-gradient-primary p-6 text-white">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Основные принципы</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Качественная и актуальная информация
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-300" />
                    Удобный и интуитивный интерфейс
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-300" />
                    Бесплатный доступ для всех
                  </li>
                  <li className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-300" />
                    Соблюдение авторских прав
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </section>

        {/* Функциональность */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Возможности приложения
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/50 border-border/50 hover-neon-primary transition-neon">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-foreground">
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Технологии */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Технологический стек
          </h2>
          
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-6 text-center">
                Проект построен с использованием современных веб-технологий
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {technologies.map((tech, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 hover-neon-primary transition-neon"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Атрибуция TMDb */}
        <section className="mb-12">
          <Card className="bg-info/10 border-info/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-info">
                <ExternalLink className="h-6 w-6" />
                Источник данных
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img 
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg"
                  alt="The Movie Database"
                  className="h-8"
                />
                <div className="flex-1">
                  <p className="text-muted-foreground">
                    Все данные о фильмах, сериалах и актёрах предоставлены{' '}
                    <a 
                      href="https://www.themoviedb.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-info hover:underline font-medium"
                    >
                      The Movie Database (TMDb)
                    </a>
                    . TMDb является открытой базой данных фильмов и телепередач, поддерживаемой сообществом.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Разработчик */}
        <section className="mb-12">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-center text-foreground">
                Разработчик
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">MrJinPro</h3>
                  <p className="text-muted-foreground">Фронтенд разработчик</p>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href="https://github.com/MrJinPro" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                  
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href="mailto:contact@mrjinpro.dev"
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Правовая информация */}
        <section>
          <Card className="bg-orange/10 border-orange/20">
            <CardHeader>
              <CardTitle className="text-orange">
                Важная информация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  • ViOn Cinema является некоммерческим образовательным проектом
                </p>
                <p>
                  • Мы не размещаем, не хостим и не распространяем защищённый авторским правом контент
                </p>
                <p>
                  • Все изображения и данные предоставлены TMDb и используются в соответствии с их условиями
                </p>
                <p>
                  • При использовании данного проекта в коммерческих целях необходимо получить соответствующие лицензии
                </p>
                <p>
                  • Проект создан исключительно в демонстрационных и образовательных целях
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;