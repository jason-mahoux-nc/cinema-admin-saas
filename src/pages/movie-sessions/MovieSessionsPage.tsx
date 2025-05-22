
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/DataTable";
import { movieSessionsApi, roomsApi, theatersApi } from "@/services/api";
import { MovieSession } from "@/types/cinema.types";
import MovieSessionsForm from "./MovieSessionsForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MovieSessionsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { 
    data: sessions = [], 
    isLoading: isSessionsLoading, 
    isError: isSessionsError 
  } = useQuery({
    queryKey: ["movie-sessions"],
    queryFn: movieSessionsApi.getAll,
    meta: {
      onError: (err: any) => {
        console.error("Erreur lors du chargement des séances:", err);
      },
    },
    retry: 1
  });

  const { 
    data: rooms = [], 
    isLoading: isRoomsLoading, 
    isError: isRoomsError 
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.getAll,
    meta: {
      onError: (err: any) => {
        console.error("Erreur lors du chargement des salles:", err);
      },
    },
    retry: 1
  });

  const { 
    data: theaters = [], 
    isLoading: isTheatersLoading, 
    isError: isTheatersError 
  } = useQuery({
    queryKey: ["theaters"],
    queryFn: theatersApi.getAll,
    meta: {
      onError: (err: any) => {
        console.error("Erreur lors du chargement des cinémas:", err);
      },
    },
    retry: 1
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => movieSessionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-sessions"] });
      toast.success("Séance supprimée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la séance");
    },
  });

  const getRoomName = (roomId: string) => {
    const room = rooms.find((room) => room.id === roomId);
    return room ? room.name : "Salle inconnue";
  };

  const getTheaterFromRoomId = (roomId: string) => {
    const room = rooms.find((room) => room.id === roomId);
    if (!room) return "Cinéma inconnu";
    
    const theater = theaters.find((theater) => theater.id === room.theaterId);
    return theater ? theater.name : "Cinéma inconnu";
  };

  const handleEdit = (session: MovieSession) => {
    // L'édition sera gérée directement dans le formulaire
  };

  const handleDelete = (session: MovieSession) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette séance ?`)) {
      deleteMutation.mutate(session.id);
    }
  };

  const isLoading = isSessionsLoading || isRoomsLoading || isTheatersLoading;
  const isError = isSessionsError || isRoomsError || isTheatersError;

  const formatDateTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), 'dd MMMM yyyy HH:mm', { locale: fr });
    } catch (e) {
      return dateTime;
    }
  };

  const columns = [
    {
      header: "Film ID",
      accessorKey: "movieId" as const,
      cell: (session: MovieSession) => (
        <span className="font-mono text-xs">
          {session.movieId.slice(0, 8)}...
        </span>
      ),
    },
    {
      header: "Date et heure",
      accessorKey: "dateTime" as const,
      cell: (session: MovieSession) => (
        <span>{formatDateTime(session.dateTime)}</span>
      ),
    },
    {
      header: "Cinéma",
      accessorKey: "roomId" as const,
      cell: (session: MovieSession) => (
        <span>{getTheaterFromRoomId(session.roomId)}</span>
      )
    },
    {
      header: "Salle",
      accessorKey: "roomId" as const,
      cell: (session: MovieSession) => (
        <span>{getRoomName(session.roomId)}</span>
      )
    },
    {
      header: "Réservable",
      accessorKey: "bookable" as const,
      cell: (session: MovieSession) => (
        <span className={session.bookable ? "text-green-500" : "text-red-500"}>
          {session.bookable ? "Oui" : "Non"}
        </span>
      ),
    },
    {
      header: "Lien externe",
      accessorKey: "externalUrl" as const,
      cell: (session: MovieSession) => (
        session.externalUrl ? (
          <a 
            href={session.externalUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="text-cinema-yellow hover:underline text-xs truncate max-w-[150px] inline-block"
          >
            {session.externalUrl}
          </a>
        ) : (
          <span className="text-cinema-gray">Non défini</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion des Projections</h1>
        <p className="text-cinema-gray mt-2">
          Administrez les séances de projection, leurs horaires et leurs disponibilités.
        </p>
      </div>

      {isError && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-white">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problème de connexion</AlertTitle>
          <AlertDescription>
            Impossible de se connecter au serveur. Les données affichées peuvent être incomplètes.
            Vous pouvez néanmoins utiliser les formulaires et voir les données déjà chargées.
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-cinema-darkGray border-cinema-gray/40">
        <CardHeader>
          <CardTitle className="text-white">Ajouter une nouvelle projection</CardTitle>
        </CardHeader>
        <CardContent>
          <MovieSessionsForm
            session={null}
            onClose={() => {
              // Form submission is handled within the form component
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-cinema-darkGray border-cinema-gray/40">
        <CardHeader>
          <CardTitle className="text-white">Liste des projections</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-pulse text-cinema-gray">Chargement des données...</div>
            </div>
          ) : (
            <DataTable
              data={sessions}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Rechercher une projection..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MovieSessionsPage;
