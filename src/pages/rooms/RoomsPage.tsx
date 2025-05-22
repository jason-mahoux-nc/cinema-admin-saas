
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/DataTable";
import { roomsApi, theatersApi } from "@/services/api";
import { Room } from "@/types/cinema.types";
import RoomsForm from "./RoomsForm";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader 
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

const RoomsPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading, isError } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.getAll,
  });

  const { data: theaters = [] } = useQuery({
    queryKey: ["theaters"],
    queryFn: theatersApi.getAll,
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
    setSelectedRoom(room);
    setOpen(true);
  };

  const handleDelete = (room: Room) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la salle ${room.name} ?`)) {
      deleteMutation.mutate(room.id);
    }
  };

  const handleAdd = () => {
    setSelectedRoom(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRoom(null);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  if (isError) {
    return <div className="text-red-500 p-8">Erreur lors du chargement des salles</div>;
  }

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

      <DataTable
        data={rooms}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        addButtonLabel="Ajouter une salle"
        searchPlaceholder="Rechercher une salle..."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-cinema-darkGray text-white border-cinema-gray">
          <DialogHeader>
            <DialogTitle>
              {selectedRoom ? "Modifier la salle" : "Ajouter une salle"}
            </DialogTitle>
          </DialogHeader>
          <RoomsForm
            room={selectedRoom}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomsPage;
