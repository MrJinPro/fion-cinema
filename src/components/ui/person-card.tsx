import React from 'react';
import { Card, CardContent } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { getTMDbClient } from '@/lib/tmdb';
import { useNavigate } from 'react-router-dom';
import type { TMDbCastMember, TMDbCrewMember } from '@/lib/tmdb';

interface PersonCardProps {
  person: TMDbCastMember | TMDbCrewMember;
  type: 'cast' | 'crew';
}

export function PersonCard({ person, type }: PersonCardProps) {
  const tmdbClient = getTMDbClient();
  const navigate = useNavigate();
  const profileUrl = tmdbClient.getProfileURL(person.profile_path, 'w185');

  const handleClick = () => {
    navigate(`/person/${person.id}`);
  };

  return (
    <Card 
      className="w-32 flex-shrink-0 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg" 
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-2">
            <AvatarImage src={profileUrl || undefined} alt={person.name} />
            <AvatarFallback className="text-xs">
              {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <h4 className="font-medium text-sm leading-tight mb-1 hover:text-primary transition-colors">
            {person.name}
          </h4>
          <p className="text-xs text-muted-foreground">
            {type === 'cast' ? (person as TMDbCastMember).character : (person as TMDbCrewMember).job}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}