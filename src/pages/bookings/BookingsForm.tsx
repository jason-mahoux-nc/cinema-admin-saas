
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Booking,
  CreateBookingApiDto,
  UpdateBookingApiDto 
} from "@/types/cinema.types";
import { bookingsApi, movieSessionsApi, seatsApi } from "@/services/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BookingsFormProps {
  booking: Booking | null;
  onClose: () => void;
}

const BookingsForm: React.FC<BookingsFormProps> = ({ booking, onClose }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateBookingApiDto | UpdateBookingApiDto>({
    defaultValues: booking || {
      screeningId: "",
      seatId: ""
    }
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["movie-sessions"],
    queryFn: movieSessionsApi.getAll,
  });

  const { data: allSeats = [] } = useQuery({
    queryKey: ["seats"],
    queryFn: seatsApi.getAll,
  });

  // Filter seats based on the selected screening
  const selectedScreeningId = watch("screeningId");
  const selectedScreening = sessions.find(s => s.id === selectedScreeningId);
  
  // Only show seats from the selected screening's room
  const availableSeats = selectedScreening 
    ? allSeats.filter(seat => seat.roomId === selectedScreening.roomId && seat.available) 
    : [];

  const createMutation = useMutation({
    mutationFn: (data: CreateBookingApiDto) => bookingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Réservation ajoutée avec succès");
      onClose();
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de la réservation");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateBookingApiDto) => 
      bookingsApi.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Réservation mise à jour avec succès");
      onClose();
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la réservation");
    },
  });

  const onSubmit = (data: CreateBookingApiDto | UpdateBookingApiDto) => {
    if (booking) {
      updateMutation.mutate({ ...data, id: booking.id } as UpdateBookingApiDto);
    } else {
      createMutation.mutate(data as CreateBookingApiDto);
    }
  };

  const formatSessionLabel = (session: any) => {
    try {
      const formattedDate = format(new Date(session.dateTime), 'dd/MM/yyyy HH:mm', { locale: fr });
      return `${session.movieId.slice(0, 6)}... - ${formattedDate}`;
    } catch (e) {
      return `${session.movieId.slice(0, 6)}... - ${session.dateTime}`;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="screeningId">Séance</Label>
          <Select
            onValueChange={(value) => setValue("screeningId", value)}
            defaultValue={watch("screeningId")}
          >
            <SelectTrigger className="dark:bg-cinema-black dark:border-cinema-gray/40">
              <SelectValue placeholder="Sélectionnez une séance" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {formatSessionLabel(session)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.screeningId && (
            <p className="text-red-500 text-sm">{errors.screeningId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="seatId">Siège</Label>
          <Select
            onValueChange={(value) => setValue("seatId", value)}
            defaultValue={watch("seatId")}
            disabled={!selectedScreeningId}
          >
            <SelectTrigger className="dark:bg-cinema-black dark:border-cinema-gray/40">
              <SelectValue placeholder="Sélectionnez un siège" />
            </SelectTrigger>
            <SelectContent>
              {availableSeats.length > 0 ? (
                availableSeats.map((seat) => (
                  <SelectItem key={seat.id} value={seat.id}>
                    {seat.name} - Position ({seat.positionX}, {seat.positionY})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  {selectedScreeningId 
                    ? "Aucun siège disponible" 
                    : "Sélectionnez d'abord une séance"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.seatId && (
            <p className="text-red-500 text-sm">{errors.seatId.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          className="bg-cinema-yellow text-black hover:bg-cinema-yellow/90"
          disabled={!watch("screeningId") || !watch("seatId")}
        >
          {booking ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
};

export default BookingsForm;
