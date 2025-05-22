
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/DataTable";
import { theatersApi } from "@/services/api";
import { Theatre } from "@/types/cinema.types";
import TheatersForm from "./TheatersForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TheatersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: theaters = [], isLoading, isError } = useQuery({
    queryKey: ["theaters"],
    queryFn: theatersApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => theatersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theaters"] });
      toast.success("Cinéma supprimé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du cinéma");
    },
  });

  const handleEdit = (theatre: Theatre) => {
    // L'édition sera gérée dans le formulaire existant
  };

  const handleDelete = (theatre: Theatre) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${theatre.name} ?`)) {
      deleteMutation.mutate(theatre.id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  if (isError) {
    return <div className="text-red-500 p-8">Erreur lors du chargement des cinémas</div>;
  }

  const columns = [
    {
      header: "Nom",
      accessorKey: "name" as const,
    },
    {
      header: "Code INSEE",
      accessorKey: "inseeCode" as const,
    },
    {
      header: "Site web",
      accessorKey: "website" as const,
      cell: (theatre: Theatre) => (
        <a 
          href={theatre.website} 
          target="_blank" 
          rel="noreferrer" 
          className="text-cinema-yellow hover:underline"
        >
          {theatre.website}
        </a>
      ),
    },
    {
      header: "Accès PMR",
      accessorKey: "wheelchair" as const,
      cell: (theatre: Theatre) => (
        <span>{theatre.wheelchair ? "Oui" : "Non"}</span>
      ),
    },
    {
      header: "3D",
      accessorKey: "threeD" as const,
      cell: (theatre: Theatre) => (
        <span>{theatre.threeD ? "Oui" : "Non"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion des Cinémas</h1>
        <p className="text-cinema-gray mt-2">
          Administrez vos cinémas, leurs informations et leurs caractéristiques.
        </p>
      </div>

      <Card className="bg-cinema-darkGray border-cinema-gray/40">
        <CardHeader>
          <CardTitle className="text-white">Ajouter un nouveau cinéma</CardTitle>
        </CardHeader>
        <CardContent>
          <TheatersForm 
            theatre={null} 
            onClose={() => {
              // Form submission is handled within the form component
            }} 
          />
        </CardContent>
      </Card>

      <Card className="bg-cinema-darkGray border-cinema-gray/40">
        <CardHeader>
          <CardTitle className="text-white">Liste des cinémas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={theaters}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Rechercher un cinéma..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TheatersPage;
