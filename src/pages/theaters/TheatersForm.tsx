
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  CreateTheaterApiDto,
  Theatre, 
  UpdateTheaterApiDto 
} from "@/types/cinema.types";
import { theatersApi } from "@/services/api";

interface TheatersFormProps {
  theatre: Theatre | null;
  onClose: () => void;
}

const TheatersForm: React.FC<TheatersFormProps> = ({ theatre, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<CreateTheaterApiDto | UpdateTheaterApiDto>({
    defaultValues: theatre || {
      name: "",
      inseeCode: "",
      website: "",
      wheelchair: false,
      threeD: false,
      pictureUrl: "",
    }
  });

  React.useEffect(() => {
    if (theatre) {
      setValue("name", theatre.name);
      setValue("inseeCode", theatre.inseeCode);
      setValue("website", theatre.website);
      setValue("wheelchair", theatre.wheelchair);
      setValue("threeD", theatre.threeD);
      setValue("pictureUrl", theatre.pictureUrl || "");
    }
  }, [theatre, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: CreateTheaterApiDto) => theatersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theaters"] });
      toast.success("Cinéma ajouté avec succès");
      reset({
        name: "",
        inseeCode: "",
        website: "",
        wheelchair: false,
        threeD: false,
        pictureUrl: "",
      });
      if (onClose) onClose();
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du cinéma");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTheaterApiDto) => 
      theatersApi.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theaters"] });
      toast.success("Cinéma mis à jour avec succès");
      if (onClose) onClose();
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du cinéma");
    },
  });

  const onSubmit = (data: CreateTheaterApiDto | UpdateTheaterApiDto) => {
    if (theatre) {
      updateMutation.mutate(data as UpdateTheaterApiDto);
    } else {
      createMutation.mutate(data as CreateTheaterApiDto);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="inseeCode">Code INSEE</Label>
          <Input
            id="inseeCode"
            {...register("inseeCode", { required: "Le code INSEE est requis" })}
            className="dark:bg-cinema-black dark:border-cinema-gray/40"
          />
          {errors.inseeCode && (
            <p className="text-red-500 text-sm">{errors.inseeCode.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Site web</Label>
          <Input
            id="website"
            type="url"
            {...register("website", { required: "Le site web est requis" })}
            className="dark:bg-cinema-black dark:border-cinema-gray/40"
          />
          {errors.website && (
            <p className="text-red-500 text-sm">{errors.website.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pictureUrl">URL de l'image</Label>
          <Input
            id="pictureUrl"
            type="url"
            {...register("pictureUrl")}
            className="dark:bg-cinema-black dark:border-cinema-gray/40"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="wheelchair" className="cursor-pointer">Accès PMR</Label>
          <Switch
            id="wheelchair"
            onCheckedChange={(checked) => setValue("wheelchair", checked)}
            checked={theatre?.wheelchair || false}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="threeD" className="cursor-pointer">Projection 3D</Label>
          <Switch
            id="threeD"
            onCheckedChange={(checked) => setValue("threeD", checked)}
            checked={theatre?.threeD || false}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="reset" variant="outline" onClick={() => reset()}>
          Réinitialiser
        </Button>
        <Button type="submit" className="bg-cinema-yellow text-black hover:bg-cinema-yellow/90">
          {theatre ? "Mettre à jour" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
};

export default TheatersForm;
