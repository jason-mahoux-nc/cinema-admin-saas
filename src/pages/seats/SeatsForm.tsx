
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CreateSeatApiDto,
  Seat, 
  UpdateSeatApiDto 
} from "@/types/cinema.types";
import { roomsApi, seatsApi } from "@/services/api";

interface SeatsFormProps {
  seat: Seat | null;
  preselectedRoomId: string | null;
  onClose: () => void;
}

const SeatsForm: React.FC<SeatsFormProps> = ({ seat, preselectedRoomId, onClose }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateSeatApiDto | UpdateSeatApiDto>({
    defaultValues: seat || {
      name: "",
      positionX: 0,
      positionY: 0,
      isAvailable: true,
      roomId: preselectedRoomId || "",
    }
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.getAll,
  });

  React.useEffect(() => {
    if (seat) {
      setValue("name", seat.name);
      setValue("positionX", seat.positionX);
      setValue("positionY", seat.positionY);
      setValue("isAvailable", seat.available);
      setValue("roomId", seat.roomId);
    } else if (preselectedRoomId) {
      setValue("roomId", preselectedRoomId);
    }
  }, [seat, setValue, preselectedRoomId]);

  const createMutation = useMutation({
    mutationFn: (data: CreateSeatApiDto) => seatsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seats"] });
      toast.success("Siège ajouté avec succès");
      onClose();
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du siège");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSeatApiDto) => 
      seatsApi.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seats"] });
      toast.success("Siège mis à jour avec succès");
      onClose();
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du siège");
    },
  });

  const onSubmit = (data: CreateSeatApiDto | UpdateSeatApiDto) => {
    if (seat) {
      updateMutation.mutate({ ...data, id: seat.id } as UpdateSeatApiDto);
    } else {
      createMutation.mutate(data as CreateSeatApiDto);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            {...register("name", { required: "Le nom est requis" })}
            className="dark:bg-cinema-black dark:border-cinema-gray/40"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="roomId">Salle</Label>
          <Select
            onValueChange={(value) => setValue("roomId", value)}
            defaultValue={watch("roomId")}
          >
            <SelectTrigger className="dark:bg-cinema-black dark:border-cinema-gray/40">
              <SelectValue placeholder="Sélectionnez une salle" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.roomId && (
            <p className="text-red-500 text-sm">{errors.roomId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="positionX">Position X</Label>
            <Input
              id="positionX"
              type="number"
              {...register("positionX", { 
                required: "La position X est requise",
                valueAsNumber: true,
              })}
              className="dark:bg-cinema-black dark:border-cinema-gray/40"
            />
            {errors.positionX && (
              <p className="text-red-500 text-sm">{errors.positionX.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="positionY">Position Y</Label>
            <Input
              id="positionY"
              type="number"
              {...register("positionY", { 
                required: "La position Y est requise",
                valueAsNumber: true,
              })}
              className="dark:bg-cinema-black dark:border-cinema-gray/40"
            />
            {errors.positionY && (
              <p className="text-red-500 text-sm">{errors.positionY.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="isAvailable" className="cursor-pointer">Disponible</Label>
          <Switch
            id="isAvailable"
            onCheckedChange={(checked) => setValue("isAvailable", checked)}
            checked={seat ? seat.available : true}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" className="bg-cinema-yellow text-black hover:bg-cinema-yellow/90">
          {seat ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
};

export default SeatsForm;
