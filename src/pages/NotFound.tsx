import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Film } from "lucide-react";
import fionLogo from "@/assets/fion-404-logo.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center relative overflow-hidden">
      {/* Cinematic background particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-accent/80 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-10 w-1 h-1 bg-primary/40 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-10 w-2 h-2 bg-accent/60 rounded-full animate-pulse" style={{animationDelay: '2.5s'}}></div>
      </div>

      <div className="text-center z-10 max-w-2xl mx-auto px-6">
        {/* FiOn Logo with blinking effect */}
        <div className="mb-8 relative">
          <img 
            src={fionLogo} 
            alt="FiOn Cinema" 
            className="h-24 md:h-32 mx-auto drop-shadow-2xl"
          />
          {/* Blinking O effect overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* This creates the blinking "O" effect - positioned over the logo */}
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary/60 animate-pulse bg-primary/10"></div>
            </div>
          </div>
        </div>

        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-br from-primary via-primary/80 to-accent bg-clip-text text-transparent drop-shadow-2xl">
            404
          </h1>
        </div>

        {/* Main message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground/90 drop-shadow-lg">
            Такой страницы нет в каталоге
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Похоже, этот фильм ещё не вышел в прокат
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={() => window.location.href = '/'} 
            size="lg"
            className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Home className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Вернуться в кинозал
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/search'} 
            variant="outline"
            size="lg"
            className="group border-primary/30 hover:border-primary text-foreground hover:bg-primary/10 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Film className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Найти фильм
          </Button>
        </div>

        {/* Cinema seats decoration */}
        <div className="mt-16 flex justify-center space-x-2 opacity-30">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="w-3 h-4 bg-muted-foreground/40 rounded-t-md"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
