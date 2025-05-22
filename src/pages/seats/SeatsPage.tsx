
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { DataTable } from "@/components/ui/DataTable";
import { seatsApi, roomsApi } from "@/services/api";
import { Seat, Room } from "@/types/cinema.types";
import SeatsForm from "./SeatsForm";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const SeatsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const roomIdFromUrl = searchParams.get("roomId");
  
  useEffect(() => {
    if (roomIdFromUrl) {
      setSelectedRoomId(roomIdFromUrl);
    }
  }, [roomIdFromUrl]);

  const { data: allSeats = [], isLoading: isSeatsLoading } = useQuery({
    queryKey: ["seats"],
    queryFn: seatsApi.getAll,
  });

  const { data: rooms = [], isLoading: isRoomsLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.getAll,
  });

  const seats = selectedRoomId 
    ? allSeats.filter(seat => seat.roomId === selectedRoomId) 
    : allSeats;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => seatsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seats"] });
      toast.success("Siège supprimé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du siège");
    },
  });

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    setSearchParams({ roomId });
  };

  const handleEdit = (seat: Seat) => {
    setSelectedSeat(seat);
    setOpen(true);
  };

  const handleDelete = (seat: Seat) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le siège ${seat.name} ?`)) {
      deleteMutation.mutate(seat.id);
    }
  };

  const handleAdd = () => {
    setSelectedSeat(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSeat(null);
  };

  const getRoomName = (roomId: string): string => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : "Salle inconnue";
  };

  const selectedRoom = rooms.find(room => room.id === selectedRoomId) as Room;

  const isLoading = isSeatsLoading || isRoomsLoading;

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  const columns = [
    {
      header: "Nom",
      accessorKey: "name" as const,
    },
    {
      header: "Salle",
      accessorKey: "roomId" as const,
      cell: (seat: Seat) => <span>{getRoomName(seat.roomId)}</span>,
    },
    {
      header: "Position X",
      accessorKey: "positionX" as const,
    },
    {
      header: "Position Y",
      accessorKey: "positionY" as const,
    },
    {
      header: "Disponible",
      accessorKey: "available" as const,
      cell: (seat: Seat) => (
        <span className={seat.available ? "text-green-500" : "text-red-500"}>
          {seat.available ? "Oui" : "Non"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion des Sièges</h1>
        <p className="text-cinema-gray mt-2">
          Administrez les sièges de vos salles de cinéma, leurs positions et leur disponibilité.
        </p>
      </div>

      <div className="bg-cinema-darkGray p-6 rounded-lg border border-cinema-gray/40">
        <div className="mb-4">
          <Label htmlFor="room-filter" className="mb-2 block">
            Filtrer par salle
          </Label>
          <Select
            value={selectedRoomId || ""}
            onValueChange={handleRoomChange}
          >
            <SelectTrigger id="room-filter" className="dark:bg-cinema-black dark:border-cinema-gray/40">
              <SelectValue placeholder="Toutes les salles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les salles</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name} ({getRoomName(room.theaterId)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedRoom && (
          <div className="mb-4 p-4 border border-cinema-gray/40 rounded-md bg-cinema-black">
            <h3 className="font-medium mb-2">Information sur la salle</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-cinema-gray">
              <div>
                <p><span className="font-medium text-white">Nom:</span> {selectedRoom.name}</p>
                <p><span className="font-medium text-white">Dimensions:</span> {selectedRoom.sizeX} x {selectedRoom.sizeY} m</p>
              </div>
              <div>
                <p><span className="font-medium text-white">Cinéma:</span> {getRoomName(selectedRoom.theaterId)}</p>
                <p><span className="font-medium text-white">Nombre de sièges:</span> {seats.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <DataTable
        data={seats}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        addButtonLabel="Ajouter un siège"
        searchPlaceholder="Rechercher un siège..."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-cinema-darkGray text-white border-cinema-gray">
          <DialogHeader>
            <DialogTitle>
              {selectedSeat ? "Modifier le siège" : "Ajouter un siège"}
            </DialogTitle>
          </DialogHeader>
          <SeatsForm
            seat={selectedSeat}
            preselectedRoomId={selectedRoomId}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatsPage;
