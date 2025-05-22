
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
  CreateMovieSessionApiDto,
  MovieSession, 
  UpdateMovieSessionApiDto 
} from "@/types/cinema.types";
import { movieSessionsApi, roomsApi } from "@/services/api";

interface MovieSessionsFormProps {
  session: MovieSession | null;
  onClose: () => void;
}

const MovieSessionsForm: React.FC<MovieSessionsFormProps> = ({ session, onClose }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateMovieSessionApiDto | UpdateMovieSessionApiDto>({
    defaultValues: session ? {
      isBookable: session.bookable,
      externalUrl: session.externalUrl,
      movieId: session.movieId,
      dateTime: session.dateTime ? new Date(session.dateTime).toISOString().slice(0, 16) : '',
      roomId: session.roomId,
      typeId: session.typeId,
    } : {
      isBookable: true,
      externalUrl: '',
      movieId: '',
      dateTime: new Date().toISOString().slice(0, 16),
      roomId: '',
      typeId: '',
    }
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMovieSessionApiDto) => movieSessionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-sessions"] });
      toast.success("Séance ajoutée avec succès");
      onClose();
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de la séance");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateMovieSessionApiDto) => 
      movieSessionsApi.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-sessions"] });
      toast.success("Séance mise à jour avec succès");
      onClose();
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la séance");
    },
  });

  const onSubmit = (data: CreateMovieSessionApiDto | UpdateMovieSessionApiDto) => {
    // Ensure dateTime is in ISO format
    const formattedData = {
      ...data,
      dateTime: new Date(data.dateTime).toISOString()
    };

    if (session) {
      updateMutation.mutate({ ...formattedData, id: session.id } as UpdateMovieSessionApiDto);
    } else {
      createMutation.mutate(formattedData as CreateMovieSessionApiDto);
    }
  };

  const sessionTypes = [
    { id: "2D", name: "2D Standard" },
    { id: "3D", name: "3D" },
    { id: "IMAX", name: "IMAX" },
    { id: "DBOX", name: "D-BOX" },
    { id: "VOST", name: "VOST" },
    { id: "VF", name: "VF" }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="movieId">ID du film</Label>
          <Input
            id="movieId"
            {...register("movieId", { required: "L'ID du film est requis" })}
            className="dark:bg-cinema-black dark:border-cinema-gray/40"
          />
          {errors.movieId && (
            <p className="text-red-500 text-sm">{errors.movieId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTime">Date et heure</Label>
          <Input
            id="dateTime"
            type="datetime-local"
            {...register("dateTime", { required: "La date et l'heure sont requises" })}
            className="dark:bg-cinema-black dark:border-cinema-gray/40"
          />
          {errors.dateTime && (
            <p className="text-red-500 text-sm">{errors.dateTime.message}</p>
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

        <div className="space-y-2">
          <Label htmlFor="typeId">Type de séance</Label>
          <Select
            onValueChange={(value) => setValue("typeId", value)}
            defaultValue={watch("typeId")}
          >
            <SelectTrigger className="dark:bg-cinema-black dark:border-cinema-gray/40">
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              {sessionTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.typeId && (
            <p className="text-red-500 text-sm">{errors.typeId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="externalUrl">Lien externe</Label>
          <Input
            id="externalUrl"
            type="url"
            {...register("externalUrl")}
            className="dark:bg-cinema-black dark:border-cinema-gray/40"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="isBookable" className="cursor-pointer">Réservable</Label>
          <Switch
            id="isBookable"
            onCheckedChange={(checked) => setValue("isBookable", checked)}
            checked={session ? session.bookable : true}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" className="bg-cinema-yellow text-black hover:bg-cinema-yellow/90">
          {session ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
};

export default MovieSessionsForm;
