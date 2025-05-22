
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/DataTable";
import { roomsApi, theatersApi } from "@/services/api";
import { Room } from "@/types/cinema.types";
import RoomsForm from "./RoomsForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const RoomsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { 
    data: rooms = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.getAll,
    onError: (err) => {
      console.error("Erreur lors du chargement des salles:", err);
    },
    retry: 1
  });

  const { 
    data: theaters = [], 
    isError: isTheatersError 
  } = useQuery({
    queryKey: ["theaters"],
    queryFn: theatersApi.getAll,
    onError: (err) => {
      console.error("Erreur lors du chargement des cinémas:", err);
    },
    retry: 1
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Salle supprimée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la salle");
    },
  });

  const handleEdit = (room: Room) => {
    // L'édition sera gérée directement dans le formulaire
  };

  const handleDelete = (room: Room) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la salle ${room.name} ?`)) {
      deleteMutation.mutate(room.id);
    }
  };

  const getTheaterName = (theaterId: string) => {
    const theater = theaters.find((theater) => theater.id === theaterId);
    return theater ? theater.name : "Cinéma inconnu";
  };

  const columns = [
    {
      header: "Nom",
      accessorKey: "name" as const,
    },
    {
      header: "Cinéma",
      accessorKey: "theaterId" as const,
      cell: (room: Room) => <span>{getTheaterName(room.theaterId)}</span>,
    },
    {
      header: "Dimensions",
      accessorKey: "sizeX" as const,
      cell: (room: Room) => <span>{room.sizeX} x {room.sizeY} m</span>,
    },
    {
      header: "Sièges",
      accessorKey: "seats" as const,
      cell: (room: Room) => (
        <Link 
          to={`/seats?roomId=${room.id}`} 
          className="text-cinema-yellow hover:underline"
        >
          Gérer les sièges
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion des Salles</h1>
        <p className="text-cinema-gray mt-2">
          Administrez les salles de vos cinémas, leurs tailles et leurs configurations.
        </p>
      </div>

      {(isError || isTheatersError) && (
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
          <CardTitle className="text-white">Ajouter une nouvelle salle</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomsForm 
            room={null} 
            onClose={() => {
              // Form submission is handled within the form component
            }} 
          />
        </CardContent>
      </Card>

      <Card className="bg-cinema-darkGray border-cinema-gray/40">
        <CardHeader>
          <CardTitle className="text-white">Liste des salles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-pulse text-cinema-gray">Chargement des données...</div>
            </div>
          ) : (
            <DataTable
              data={rooms}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Rechercher une salle..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomsPage;
