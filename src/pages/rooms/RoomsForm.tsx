
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CreateRoomApiDto,
  Room, 
  UpdateRoomApiDto 
} from "@/types/cinema.types";
import { roomsApi, screensApi, theatersApi } from "@/services/api";

interface RoomsFormProps {
  room: Room | null;
  onClose: () => void;
}

const RoomsForm: React.FC<RoomsFormProps> = ({ room, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateRoomApiDto | UpdateRoomApiDto>({
    defaultValues: room || {
      name: "",
      sizeX: 0,
      sizeY: 0,
      screenId: "",
      theaterId: "",
    }
  });

  const { data: theaters = [] } = useQuery({
    queryKey: ["theaters"],
    queryFn: theatersApi.getAll,
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["screens"],
    queryFn: screensApi.getAll,
  });

  React.useEffect(() => {
    if (room) {
      setValue("name", room.name);
      setValue("sizeX", room.sizeX);
      setValue("sizeY", room.sizeY);
      setValue("screenId", room.screenId);
      setValue("theaterId", room.theaterId);
    }
  }, [room, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: CreateRoomApiDto) => roomsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Salle ajoutée avec succès");
      onClose();
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de la salle");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateRoomApiDto) => 
      roomsApi.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Salle mise à jour avec succès");
      onClose();
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la salle");
    },
  });

  const onSubmit = (data: CreateRoomApiDto | UpdateRoomApiDto) => {
    if (room) {
      updateMutation.mutate({ ...data, id: room.id } as UpdateRoomApiDto);
    } else {
      createMutation.mutate(data as CreateRoomApiDto);
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
          <Label htmlFor="theaterId">Cinéma</Label>
          <Select
            onValueChange={(value) => setValue("theaterId", value)}
            defaultValue={watch("theaterId")}
          >
            <SelectTrigger className="dark:bg-cinema-black dark:border-cinema-gray/40">
              <SelectValue placeholder="Sélectionnez un cinéma" />
            </SelectTrigger>
            <SelectContent>
              {theaters.map((theater) => (
                <SelectItem key={theater.id} value={theater.id}>
                  {theater.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.theaterId && (
            <p className="text-red-500 text-sm">{errors.theaterId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="screenId">Écran</Label>
          <Select
            onValueChange={(value) => setValue("screenId", value)}
            defaultValue={watch("screenId")}
          >
            <SelectTrigger className="dark:bg-cinema-black dark:border-cinema-gray/40">
              <SelectValue placeholder="Sélectionnez un écran" />
            </SelectTrigger>
            <SelectContent>
              {screens.map((screen) => (
                <SelectItem key={screen.id} value={screen.id}>
                  Écran {screen.id.slice(0, 6)} ({screen.sizeX} x {screen.sizeY} m)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.screenId && (
            <p className="text-red-500 text-sm">{errors.screenId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sizeX">Largeur (m)</Label>
            <Input
              id="sizeX"
              type="number"
              step="0.1"
              {...register("sizeX", { 
                required: "La largeur est requise",
                valueAsNumber: true,
              })}
              className="dark:bg-cinema-black dark:border-cinema-gray/40"
            />
            {errors.sizeX && (
              <p className="text-red-500 text-sm">{errors.sizeX.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sizeY">Longueur (m)</Label>
            <Input
              id="sizeY"
              type="number"
              step="0.1"
              {...register("sizeY", { 
                required: "La longueur est requise",
                valueAsNumber: true,
              })}
              className="dark:bg-cinema-black dark:border-cinema-gray/40"
            />
            {errors.sizeY && (
              <p className="text-red-500 text-sm">{errors.sizeY.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" className="bg-cinema-yellow text-black hover:bg-cinema-yellow/90">
          {room ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
};

export default RoomsForm;
