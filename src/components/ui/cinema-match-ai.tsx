import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Heart, Coffee, Zap, Sun, Cloud, Moon, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface MoodData {
  mood: string;
  energy: string;
  time_of_day: string;
  weather?: string;
  stress_level: string;
  social_preference: string;
}

interface MovieRecommendation {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  genres: string[];
  match_reason: string;
}

const moods = [
  { emoji: '😊', label: 'Счастливый', value: 'happy' },
  { emoji: '😔', label: 'Грустный', value: 'sad' },
  { emoji: '😤', label: 'Стресс', value: 'stressed' },
  { emoji: '😴', label: 'Расслабленный', value: 'relaxed' },
  { emoji: '🤔', label: 'Задумчивый', value: 'thoughtful' },
  { emoji: '😎', label: 'Уверенный', value: 'confident' }
];

const energyLevels = [
  { icon: <Zap className="h-4 w-4" />, label: 'Высокая', value: 'high' },
  { icon: <Coffee className="h-4 w-4" />, label: 'Средняя', value: 'medium' },
  { icon: <Moon className="h-4 w-4" />, label: 'Низкая', value: 'low' }
];

export const CinemaMatchAI = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [moodData, setMoodData] = useState<Partial<MoodData>>({});
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [feedback, setFeedback] = useState('');

  const getCurrentTimeContext = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const getWeatherContext = () => {
    // В реальном приложении здесь был бы API погоды
    const weathers = ['sunny', 'cloudy', 'rainy'];
    return weathers[Math.floor(Math.random() * weathers.length)];
  };

  useEffect(() => {
    if (isOpen) {
      setMoodData({
        time_of_day: getCurrentTimeContext(),
        weather: getWeatherContext()
      });
    }
  }, [isOpen]);

  const handleMoodSelect = (mood: string) => {
    setMoodData(prev => ({ ...prev, mood }));
    setStep(2);
  };

  const handleEnergySelect = (energy: string) => {
    setMoodData(prev => ({ ...prev, energy }));
    setStep(3);
  };

  const handleFinalQuestions = (stress: string, social: string) => {
    setMoodData(prev => ({ 
      ...prev, 
      stress_level: stress,
      social_preference: social
    }));
    getRecommendations();
  };

  const getRecommendations = async () => {
    setIsLoading(true);
    setStep(4);
    
    try {
      const sessionData = {
        user_id: user?.id || null,
        session_type: 'mood',
        mood_data: moodData,
        context_data: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      };

      // Сохраняем сессию
      const { data: session } = await supabase
        .from('cinema_match_sessions')
        .insert(sessionData)
        .select()
        .single();

      // Вызываем AI функцию для получения рекомендаций
      const { data: aiResponse, error } = await supabase.functions.invoke('ai', {
        body: {
          type: 'cinema_match',
          mood_data: moodData,
          context: {
            time_of_day: moodData.time_of_day,
            weather: moodData.weather
          }
        }
      });

      if (error) throw error;

      setRecommendations(aiResponse.recommendations || []);
      
      // Обновляем сессию с рекомендациями
      if (session) {
        await supabase
          .from('cinema_match_sessions')
          .update({ recommendations: aiResponse.recommendations })
          .eq('id', session.id);
      }

    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить рекомендации. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieSelect = async (movie: MovieRecommendation) => {
    try {
      // Сохраняем выбор пользователя
      await supabase
        .from('cinema_match_sessions')
        .update({ 
          selected_movie_id: movie.id,
          feedback: { selected: true, timestamp: new Date().toISOString() }
        })
        .eq('user_id', user?.id || null)
        .order('created_at', { ascending: false })
        .limit(1);

      // Переходим на страницу фильма
      navigate(`/movie/${movie.id}`);
      setIsOpen(false);
      setStep(1);
      setMoodData({});
      setRecommendations([]);
    } catch (error) {
      console.error('Error saving movie selection:', error);
    }
  };

  const handleFeedback = async () => {
    try {
      await supabase
        .from('cinema_match_sessions')
        .update({ 
          feedback: { 
            rating: feedback,
            timestamp: new Date().toISOString() 
          }
        })
        .eq('user_id', user?.id || null)
        .order('created_at', { ascending: false })
        .limit(1);

      toast({
        title: "Спасибо за отзыв!",
        description: "Ваше мнение поможет нам улучшить рекомендации.",
      });

      setIsOpen(false);
      setStep(1);
      setMoodData({});
      setRecommendations([]);
      setFeedback('');
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Как у вас дела сегодня?</h3>
              <p className="text-sm text-muted-foreground">
                Выберите настроение, которое больше всего соответствует вашему состоянию
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {moods.map((mood) => (
                <Button
                  key={mood.value}
                  variant="outline"
                  className="h-16 flex flex-col gap-2"
                  onClick={() => handleMoodSelect(mood.value)}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-sm">{mood.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Сколько у вас энергии?</h3>
              <p className="text-sm text-muted-foreground">
                Это поможет подобрать фильм нужного темпа
              </p>
            </div>
            <div className="space-y-3">
              {energyLevels.map((level) => (
                <Button
                  key={level.value}
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => handleEnergySelect(level.value)}
                >
                  {level.icon}
                  <span>{level.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Последние вопросы</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Уровень стресса:</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleFinalQuestions('low', 'alone')}>
                    Низкий
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleFinalQuestions('medium', 'alone')}>
                    Средний
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleFinalQuestions('high', 'alone')}>
                    Высокий
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        if (isLoading) {
          return (
            <div className="text-center py-8">
              <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Анализируем ваше настроение...</h3>
              <p className="text-sm text-muted-foreground">
                Подбираем идеальные фильмы специально для вас
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Рекомендации для вас</h3>
              <p className="text-sm text-muted-foreground">
                Основано на вашем настроении и предпочтениях
              </p>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recommendations.map((movie) => (
                <Card 
                  key={movie.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleMovieSelect(movie)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="w-16 h-24 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold">{movie.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {movie.match_reason}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            ⭐ {movie.vote_average.toFixed(1)}
                          </Badge>
                          {movie.genres.slice(0, 2).map((genre) => (
                            <Badge key={genre} variant="outline" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-3">
              <Textarea
                placeholder="Как вам наши рекомендации? (необязательно)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="text-sm"
              />
              <Button onClick={handleFeedback} className="w-full">
                Завершить
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          size="lg"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            CinemaMatch AI
          </DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};