import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Поиск фильмов и сериалов...",
  className,
  debounceMs = 350,
}) => {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const handleInputChange = useCallback((newValue: string) => {
    onChange(newValue);

    if (onSearch && debounceMs > 0) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);

      setDebounceTimer(timer);
    }
  }, [onChange, onSearch, debounceMs, debounceTimer]);

  const handleClear = useCallback(() => {
    onChange('');
    if (onSearch) {
      onSearch('');
    }
  }, [onChange, onSearch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  }, [onSearch, value]);

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        
        <Input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-20 bg-card/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary transition-neon"
        />

        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-1">
          {value && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-muted"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            type="submit"
            size="sm"
            variant="secondary"
            className="h-8 px-3 hover-neon-primary"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};