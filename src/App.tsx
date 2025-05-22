
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TheatersPage from "./pages/theaters/TheatersPage";
import RoomsPage from "./pages/rooms/RoomsPage";
import SeatsPage from "./pages/seats/SeatsPage";
import MovieSessionsPage from "./pages/movie-sessions/MovieSessionsPage";
import BookingsPage from "./pages/bookings/BookingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" theme="dark" />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/theaters" element={<TheatersPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/seats" element={<SeatsPage />} />
            <Route path="/movie-sessions" element={<MovieSessionsPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
