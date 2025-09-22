import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Calendar, MapPin, Users, Film, Tv, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MovieCard } from '@/components/ui/movie-card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { 
  usePersonDetails, 
  usePersonMovieCredits, 
  usePersonTVCredits, 
  usePersonImages, 
  usePersonExternalIds 
} from '@/hooks/useTMDbApi';
import { getTMDbClient } from '@/lib/tmdb';

export default function PersonDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  
  const personId = parseInt(id || '0');
  const tmdbClient = getTMDbClient();

  const { data: person, isLoading: personLoading, error: personError } = usePersonDetails(personId);
  const { data: movieCredits, isLoading: movieCreditsLoading } = usePersonMovieCredits(personId);
  const { data: tvCredits, isLoading: tvCreditsLoading } = usePersonTVCredits(personId);
  const { data: images, isLoading: imagesLoading } = usePersonImages(personId);
  const { data: externalIds, isLoading: externalLoading } = usePersonExternalIds(personId);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  if (personLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchValue={searchInput} onSearchChange={setSearchInput} onSearch={handleSearch} />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <Skeleton className="w-full aspect-[3/4] rounded-lg" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (personError || !person) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchValue={searchInput} onSearchChange={setSearchInput} onSearch={handleSearch} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Персона не найдена</h1>
            <p className="text-muted-foreground">Извините, информация об этой персоне недоступна.</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться на главную
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const profileUrl = tmdbClient.getProfileURL(person.profile_path, 'original');
  const knownForMovies = movieCredits?.cast?.slice(0, 10) || [];
  const knownForTV = tvCredits?.cast?.slice(0, 10) || [];
  const age = person.birthday ? Math.floor((new Date().getTime() - new Date(person.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

  const socialLinks = [
    { name: 'IMDb', url: externalIds?.imdb_id ? `https://www.imdb.com/name/${externalIds.imdb_id}` : null, icon: Globe },
    { name: 'Instagram', url: externalIds?.instagram_id ? `https://instagram.com/${externalIds.instagram_id}` : null, icon: ExternalLink },
    { name: 'Twitter', url: externalIds?.twitter_id ? `https://twitter.com/${externalIds.twitter_id}` : null, icon: ExternalLink },
    { name: 'Facebook', url: externalIds?.facebook_id ? `https://facebook.com/${externalIds.facebook_id}` : null, icon: ExternalLink },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-background">
      <Header searchValue={searchInput} onSearchChange={setSearchInput} onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Левая колонка - фото и основная информация */}
          <div className="space-y-6">
            <div className="text-center">
              <Avatar className="w-full max-w-sm aspect-[3/4] mx-auto mb-4">
                <AvatarImage src={profileUrl || undefined} alt={person.name} className="object-cover" />
                <AvatarFallback className="text-2xl">
                  {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold mb-2">{person.name}</h1>
              <Badge variant="secondary" className="mb-4">
                {person.known_for_department}
              </Badge>
            </div>

            {/* Личная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Личная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {person.birthday && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Дата рождения</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(person.birthday).toLocaleDateString('ru-RU')}
                        {age && ` (${age} лет)`}
                      </p>
                    </div>
                  </div>
                )}
                
                {person.place_of_birth && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Место рождения</p>
                      <p className="text-sm text-muted-foreground">{person.place_of_birth}</p>
                    </div>
                  </div>
                )}

                {person.also_known_as && person.also_known_as.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Также известен как</p>
                    <div className="flex flex-wrap gap-1">
                      {person.also_known_as.slice(0, 3).map((name, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Социальные сети */}
            {socialLinks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Социальные сети</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <Button 
                        key={link.name} 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <a href={link.url!} target="_blank" rel="noopener noreferrer">
                          <link.icon className="h-4 w-4 mr-1" />
                          {link.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Правая колонка - основной контент */}
          <div className="md:col-span-2">
            <Tabs defaultValue="biography" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="biography">Биография</TabsTrigger>
                <TabsTrigger value="movies">
                  <Film className="h-4 w-4 mr-2" />
                  Фильмы
                </TabsTrigger>
                <TabsTrigger value="tv">
                  <Tv className="h-4 w-4 mr-2" />
                  Сериалы
                </TabsTrigger>
                <TabsTrigger value="photos">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Фото
                </TabsTrigger>
              </TabsList>

              <TabsContent value="biography">
                <Card>
                  <CardHeader>
                    <CardTitle>Биография</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {person.biography ? (
                      <div className="prose prose-sm max-w-none">
                        {person.biography.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 text-sm leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Биография недоступна.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="movies">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Film className="h-5 w-5" />
                      Известные фильмы
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {movieCreditsLoading ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                          <Skeleton key={i} className="aspect-[2/3] w-full" />
                        ))}
                      </div>
                    ) : knownForMovies.length > 0 ? (
                      <ScrollArea className="w-full">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {knownForMovies.map((movie) => (
                            <MovieCard 
                              key={movie.id} 
                              item={movie} 
                              type="movie" 
                              className="w-full"
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <p className="text-muted-foreground">Фильмы не найдены.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tv">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tv className="h-5 w-5" />
                      Известные сериалы
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tvCreditsLoading ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                          <Skeleton key={i} className="aspect-[2/3] w-full" />
                        ))}
                      </div>
                    ) : knownForTV.length > 0 ? (
                      <ScrollArea className="w-full">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {knownForTV.map((show) => (
                            <MovieCard 
                              key={show.id} 
                              item={show} 
                              type="tv" 
                              className="w-full"
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <p className="text-muted-foreground">Сериалы не найдены.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Фотографии
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {imagesLoading ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                          <Skeleton key={i} className="aspect-[3/4] w-full" />
                        ))}
                      </div>
                    ) : images?.profiles && images.profiles.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.profiles.slice(0, 12).map((image, index) => (
                          <Dialog key={index}>
                            <DialogTrigger asChild>
                              <div className="relative cursor-pointer group overflow-hidden rounded-lg">
                                <img
                                  src={tmdbClient.getImageURL(image.file_path, 'w342')!}
                                  alt={`${person.name} фото ${index + 1}`}
                                  className="w-full aspect-[3/4] object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <img
                                src={tmdbClient.getImageURL(image.file_path, 'original')!}
                                alt={`${person.name} фото ${index + 1}`}
                                className="w-full h-auto"
                              />
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Фотографии недоступны.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}