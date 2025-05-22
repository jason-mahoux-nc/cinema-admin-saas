
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/DataTable";
import { movieSessionsApi, roomsApi, theatersApi } from "@/services/api";
import { MovieSession } from "@/types/cinema.types";
import MovieSessionsForm from "./MovieSessionsForm";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader 
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const MovieSessionsPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<MovieSession | null>(null);
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ["movie-sessions"],
    queryFn: movieSessionsApi.getAll,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.getAll,
  });

  const { data: theaters = [] } = useQuery({
    queryKey: ["theaters"],
    queryFn: theatersApi.getAll,
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
    setSelectedSession(session);
    setOpen(true);
  };

  const handleDelete = (session: MovieSession) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette séance ?`)) {
      deleteMutation.mutate(session.id);
    }
  };

  const handleAdd = () => {
    setSelectedSession(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSession(null);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  if (isError) {
    return <div className="text-red-500 p-8">Erreur lors du chargement des séances</div>;
  }

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

      <DataTable
        data={sessions}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        addButtonLabel="Ajouter une projection"
        searchPlaceholder="Rechercher une projection..."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-cinema-darkGray text-white border-cinema-gray">
          <DialogHeader>
            <DialogTitle>
              {selectedSession ? "Modifier la projection" : "Ajouter une projection"}
            </DialogTitle>
          </DialogHeader>
          <MovieSessionsForm
            session={selectedSession}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MovieSessionsPage;
