import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
import About from "./pages/About";
import Favorites from "./pages/Favorites";
import Lists from "./pages/Lists";
import { ListDetails } from "./pages/ListDetails";
import { MovieDetails } from "./pages/MovieDetails";
import TVDetails from "./pages/TVDetails";
import PersonDetails from "./pages/PersonDetails";
import { Categories } from "./pages/Categories";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import RussianCinema from "./pages/RussianCinema";
import Collection from "./pages/Collection";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log("FiOn Cinema App загружается...");
  
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ backgroundColor: '#0B0F17', color: '#F8FAFC' }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/lists" element={<Lists />} />
              <Route path="/lists/:id" element={<ListDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/russian-cinema" element={<RussianCinema />} />
              <Route path="/collections/:slug" element={<Collection />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/tv/:id" element={<TVDetails />} />
              <Route path="/person/:id" element={<PersonDetails />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;
