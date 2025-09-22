import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { PersonCard } from './person-card';
import { ScrollArea } from './scroll-area';
import type { TMDbCredits } from '@/lib/tmdb';

interface CastSectionProps {
  credits: TMDbCredits;
}

export function CastSection({ credits }: CastSectionProps) {
  const cast = credits.cast.slice(0, 20); // Top 20 cast members
  const crew = credits.crew.filter(member => 
    ['Director', 'Producer', 'Screenplay', 'Writer'].includes(member.job)
  ).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Cast */}
      <Card>
        <CardHeader>
          <CardTitle>В ролях</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="flex space-x-4 pb-4">
              {cast.map((person) => (
                <PersonCard key={person.id} person={person} type="cast" />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Key Crew */}
      {crew.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Съёмочная группа</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="flex space-x-4 pb-4">
                {crew.map((person) => (
                  <PersonCard key={`${person.id}-${person.job}`} person={person} type="crew" />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}