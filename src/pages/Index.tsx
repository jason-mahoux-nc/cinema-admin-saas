
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { theatersApi, roomsApi, seatsApi, movieSessionsApi, bookingsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: theaters = [] } = useQuery({
    queryKey: ["theaters"],
    queryFn: theatersApi.getAll
  });
  
  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.getAll
  });
  
  const { data: seats = [] } = useQuery({
    queryKey: ["seats"],
    queryFn: seatsApi.getAll
  });
  
  const { data: sessions = [] } = useQuery({
    queryKey: ["movie-sessions"],
    queryFn: movieSessionsApi.getAll
  });
  
  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings"],
    queryFn: bookingsApi.getAll
  });

  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.dateTime);
    const today = new Date();
    return sessionDate.getDate() === today.getDate() &&
           sessionDate.getMonth() === today.getMonth() &&
           sessionDate.getFullYear() === today.getFullYear();
  });

  const pendingBookings = bookings.filter(booking => 
    booking.status === "PENDING"
  );

  const stats = [
    { 
      title: "Cinémas", 
      value: theaters.length, 
      description: "Cinémas administrés",
      action: () => navigate("/theaters"),
      color: "bg-blue-500"
    },
    { 
      title: "Salles", 
      value: rooms.length, 
      description: "Salles de projection",
      action: () => navigate("/rooms"),
      color: "bg-purple-500"
    },
    { 
      title: "Sièges", 
      value: seats.length, 
      description: "Sièges disponibles",
      action: () => navigate("/seats"),
      color: "bg-green-500"
    },
    { 
      title: "Projections aujourd'hui", 
      value: todaySessions.length, 
      description: "Séances du jour",
      action: () => navigate("/movie-sessions"),
      color: "bg-orange-500"
    },
    { 
      title: "Réservations en attente", 
      value: pendingBookings.length, 
      description: "À confirmer",
      action: () => navigate("/bookings"),
      color: "bg-red-500"
    },
    { 
      title: "Total des réservations", 
      value: bookings.length, 
      description: "Toutes réservations",
      action: () => navigate("/bookings"),
      color: "bg-teal-500"
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-2">
          <h1 className="text-4xl font-bold text-white">
            Tableau de bord
          </h1>
          <p className="text-cinema-gray mt-2">
            Bienvenue dans l'administration de votre cinéma indépendant
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-cinema-gray/40 dark:bg-cinema-darkGray hover:bg-cinema-darkGray/90 transition-colors cursor-pointer"
            onClick={stat.action}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-white">{stat.title}</CardTitle>
              <CardDescription>{stat.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className={`${stat.color} w-14 h-14 rounded-full flex items-center justify-center mr-4`}>
                  <span className="text-xl font-bold text-white">{stat.value}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="dark:border-cinema-gray/40 dark:text-white hover:dark:bg-cinema-gray/40"
                >
                  Gérer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border-t border-cinema-gray/40 pt-8">
        <h2 className="text-2xl font-bold mb-4 text-white">Accès rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            className="bg-cinema-yellow text-black hover:bg-cinema-yellow/90 h-14" 
            onClick={() => navigate("/theaters")}
          >
            Gérer les cinémas
          </Button>
          <Button 
            className="bg-cinema-yellow text-black hover:bg-cinema-yellow/90 h-14" 
            onClick={() => navigate("/rooms")}
          >
            Gérer les salles
          </Button>
          <Button 
            className="bg-cinema-yellow text-black hover:bg-cinema-yellow/90 h-14" 
            onClick={() => navigate("/movie-sessions")}
          >
            Gérer les projections
          </Button>
          <Button 
            className="bg-cinema-yellow text-black hover:bg-cinema-yellow/90 h-14" 
            onClick={() => navigate("/bookings")}
          >
            Gérer les réservations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
