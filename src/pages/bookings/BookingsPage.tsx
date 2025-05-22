
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/DataTable";
import { bookingsApi, movieSessionsApi, seatsApi } from "@/services/api";
import { Booking } from "@/types/cinema.types";
import BookingsForm from "./BookingsForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const BookingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, isError } = useQuery({
    queryKey: ["bookings"],
    queryFn: bookingsApi.getAll,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["movie-sessions"],
    queryFn: movieSessionsApi.getAll,
  });

  const { data: seats = [] } = useQuery({
    queryKey: ["seats"],
    queryFn: seatsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Réservation supprimée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la réservation");
    },
  });

  const getSessionDateTime = (screeningId: string) => {
    const session = sessions.find((s) => s.id === screeningId);
    if (!session) return "Date inconnue";

    try {
      return format(new Date(session.dateTime), 'dd MMMM yyyy HH:mm', { locale: fr });
    } catch (e) {
      return session.dateTime;
    }
  };

  const getSessionMovieId = (screeningId: string) => {
    const session = sessions.find((s) => s.id === screeningId);
    return session ? session.movieId : "Film inconnu";
  };

  const getSeatName = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId);
    return seat ? seat.name : "Siège inconnu";
  };

  const handleEdit = (booking: Booking) => {
    // L'édition sera gérée directement dans le formulaire
  };

  const handleDelete = (booking: Booking) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette réservation ?`)) {
      deleteMutation.mutate(booking.id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  if (isError) {
    return <div className="text-red-500 p-8">Erreur lors du chargement des réservations</div>;
  }

  const columns = [
    {
      header: "ID Réservation",
      accessorKey: "id" as const,
      cell: (booking: Booking) => (
        <span className="font-mono text-xs">
          {booking.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      header: "Utilisateur",
      accessorKey: "userId" as const,
      cell: (booking: Booking) => (
        <span className="font-mono text-xs">
          {booking.userId.slice(0, 8)}...
        </span>
      ),
    },
    {
      header: "Film",
      accessorKey: "screeningId" as const,
      cell: (booking: Booking) => (
        <span className="font-mono text-xs">
          {getSessionMovieId(booking.screeningId).slice(0, 8)}...
        </span>
      ),
    },
    {
      header: "Date et heure",
      accessorKey: "screeningId" as const,
      cell: (booking: Booking) => (
        <span>{getSessionDateTime(booking.screeningId)}</span>
      ),
    },
    {
      header: "Siège",
      accessorKey: "seatId" as const,
      cell: (booking: Booking) => (
        <span>{getSeatName(booking.seatId)}</span>
      ),
    },
    {
      header: "Statut",
      accessorKey: "status" as const,
      cell: (booking: Booking) => (
        <span className={
          booking.status === "CONFIRMED" ? "text-green-500" : 
          booking.status === "PENDING" ? "text-yellow-500" : 
          "text-red-500"
        }>
          {booking.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion des Réservations</h1>
        <p className="text-cinema-gray mt-2">
          Administrez les réservations pour vos séances de cinéma.
        </p>
      </div>

      <Card className="bg-cinema-darkGray border-cinema-gray/40">
        <CardHeader>
          <CardTitle className="text-white">Ajouter une nouvelle réservation</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingsForm
            booking={null}
            onClose={() => {
              // Form submission is handled within the form component
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-cinema-darkGray border-cinema-gray/40">
        <CardHeader>
          <CardTitle className="text-white">Liste des réservations</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={bookings}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Rechercher une réservation..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsPage;
