import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Film, Heart, Users, Clock, Calendar } from 'lucide-react';

export interface QuizAnswers {
  mood?: string;
  company?: string;
  genres?: string[];
  duration?: string;
  movieAge?: string;
}

interface MovieQuizProps {
  onComplete: (answers: QuizAnswers) => void;
  onCancel: () => void;
}

const QUIZ_QUESTIONS = [
  {
    id: 'mood',
    title: 'Какое у вас настроение?',
    icon: Heart,
    options: [
      { value: 'happy', label: 'Веселое 😄' },
      { value: 'romantic', label: 'Романтичное 💕' },
      { value: 'tense', label: 'Хочу напряжения 😤' },
      { value: 'sad', label: 'Грустное 😢' },
      { value: 'relaxed', label: 'Расслабленное 😌' },
    ]
  },
  {
    id: 'company',
    title: 'Будете смотреть один или с кем-то?',
    icon: Users,
    options: [
      { value: 'alone', label: 'Один' },
      { value: 'couple', label: 'С парой' },
      { value: 'friends', label: 'С друзьями' },
      { value: 'family', label: 'С семьей' },
    ]
  },
  {
    id: 'genres',
    title: 'Предпочитаемые жанры?',
    icon: Film,
    multiple: true,
    options: [
      { value: 'comedy', label: 'Комедия' },
      { value: 'drama', label: 'Драма' },
      { value: 'action', label: 'Экшен' },
      { value: 'horror', label: 'Ужасы' },
      { value: 'scifi', label: 'Фантастика' },
      { value: 'romance', label: 'Романтика' },
      { value: 'thriller', label: 'Триллер' },
      { value: 'animation', label: 'Анимация' },
    ]
  },
  {
    id: 'duration',
    title: 'Сколько времени есть?',
    icon: Clock,
    options: [
      { value: 'short', label: 'До 90 минут' },
      { value: 'medium', label: '90-150 минут' },
      { value: 'long', label: 'Больше 150 минут' },
    ]
  },
  {
    id: 'movieAge',
    title: 'Предпочитаете новинки или классику?',
    icon: Calendar,
    options: [
      { value: 'new', label: 'Последние 3 года' },
      { value: 'recent', label: '5-10 лет назад' },
      { value: 'classic', label: 'Классика' },
    ]
  },
];

export const MovieQuiz: React.FC<MovieQuizProps> = ({ onComplete, onCancel }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;
  const question = QUIZ_QUESTIONS[currentQuestion];
  const Icon = question.icon;

  const handleAnswer = (value: string) => {
    const updatedAnswers = { ...answers };
    
    if (question.multiple) {
      const currentGenres = updatedAnswers.genres || [];
      if (currentGenres.includes(value)) {
        updatedAnswers.genres = currentGenres.filter(g => g !== value);
      } else {
        updatedAnswers.genres = [...currentGenres, value];
      }
    } else {
      (updatedAnswers as any)[question.id] = value;
    }
    
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleSkip = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(answers);
    }
  };

  const isAnswered = question.multiple 
    ? (answers.genres && answers.genres.length > 0)
    : answers[question.id as keyof QuizAnswers];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card border-border">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Icon className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Подбор фильма</CardTitle>
        </div>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground">
          Вопрос {currentQuestion + 1} из {QUIZ_QUESTIONS.length}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">{question.title}</h3>
          
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {question.options.map((option) => {
              const isSelected = question.multiple
                ? answers.genres?.includes(option.value)
                : answers[question.id as keyof QuizAnswers] === option.value;
                
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleAnswer(option.value)}
                  className="p-4 h-auto text-left justify-start"
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
          
          {question.multiple && answers.genres && answers.genres.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Выбрано:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {answers.genres.map((genre) => {
                  const option = question.options.find(opt => opt.value === genre);
                  return (
                    <Badge key={genre} variant="secondary">
                      {option?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            onClick={handleSkip}
          >
            Пропустить
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isAnswered && !question.multiple}
            className="min-w-24"
          >
            {currentQuestion === QUIZ_QUESTIONS.length - 1 ? 'Найти фильмы' : 'Далее'}
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
          >
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};