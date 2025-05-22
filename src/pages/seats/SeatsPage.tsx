
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { DataTable } from "@/components/ui/DataTable";
import { seatsApi, roomsApi } from "@/services/api";
import { Seat, Room } from "@/types/cinema.types";
import SeatsForm from "./SeatsForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SeatsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const roomIdFromUrl = searchParams.get("roomId");
  
  useEffect(() => {
    if (roomIdFromUrl) {
      setSelectedRoomId(roomIdFromUrl);
    }
  }, [roomIdFromUrl]);

  const { 
    data: allSeats = [], 
    isLoading: isSeatsLoading, 
    isError: isSeatsError 
  } = useQuery({
    queryKey: ["seats"],
    queryFn: seatsApi.getAll,
    meta: {
      onError: (err: any) => {
        console.error("Erreur lors du chargement des sièges:", err);
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
    if (roomId === "all") {
      setSelectedRoomId(null);
      setSearchParams({});
    } else {
      setSelectedRoomId(roomId);
      setSearchParams({ roomId });
    }
  };

  const handleEdit = (seat: Seat) => {
    // L'édition sera gérée directement dans le formulaire
  };

  const handleDelete = (seat: Seat) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le siège ${seat.name} ?`)) {
      deleteMutation.mutate(seat.id);
    }
  };

  const getRoomName = (roomId: string): string => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : "Salle inconnue";
  };

  const selectedRoom = rooms.find(room => room.id === selectedRoomId) as Room;

  const isLoading = isSeatsLoading || isRoomsLoading;

  // Define the columns for the DataTable
  // We're updating these to match the Seat type definition
  const columns = [
    {
      header: "Nom",
      accessorKey: "name" as keyof Seat,
    },
    {
      header: "Salle",
      accessorKey: "roomId" as keyof Seat,
      cell: (item: Seat) => (
        <span>{getRoomName(item.roomId)}</span>
      ),
    },
    {
      header: "Position X",
      accessorKey: "positionX" as keyof Seat,
    },
    {
      header: "Position Y",
      accessorKey: "positionY" as keyof Seat,
    },
    {
      header: "Disponibilité",
      accessorKey: "available" as keyof Seat,
      cell: (item: Seat) => (
        <span className={
          item.available ? "text-green-500" : "text-red-500"
        }>
          {item.available ? "Disponible" : "Indisponible"}
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

      {(isSeatsError || isRoomsError) && (
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
          <CardTitle className="text-white">Filtrer par salle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="room-filter" className="mb-2 block">
              Sélectionnez une salle
            </Label>
            <Select
              value={selectedRoomId || "all"}
              onValueChange={handleRoomChange}
            >
              <SelectTrigger id="room-filter" className="dark:bg-cinema-black dark:border-cinema-gray/40">
                <SelectValue placeholder="Toutes les salles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les salles</SelectItem>
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
        </CardContent>
      </Card>

      <Card className="bg-cinema-darkGray border-cinema-gray/40">
        <CardHeader>
          <CardTitle className="text-white">Ajouter un nouveau siège</CardTitle>
        </CardHeader>
        <CardContent>
          <SeatsForm
            seat={null}
            preselectedRoomId={selectedRoomId}
            onClose={() => {
              // Form submission is handled within the form component
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-cinema-darkGray border-cinema-gray/40">
        <CardHeader>
          <CardTitle className="text-white">Liste des sièges</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-pulse text-cinema-gray">Chargement des données...</div>
            </div>
          ) : (
            <DataTable
              data={seats}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Rechercher un siège..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatsPage;

