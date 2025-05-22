
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/DataTable";
import { theatersApi } from "@/services/api";
import { Theatre } from "@/types/cinema.types";
import TheatersForm from "./TheatersForm";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader 
} from "@/components/ui/dialog";

const TheatersPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | null>(null);
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
    setSelectedTheatre(theatre);
    setOpen(true);
  };

  const handleDelete = (theatre: Theatre) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${theatre.name} ?`)) {
      deleteMutation.mutate(theatre.id);
    }
  };

  const handleAdd = () => {
    setSelectedTheatre(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTheatre(null);
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

      <DataTable
        data={theaters}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        addButtonLabel="Ajouter un cinéma"
        searchPlaceholder="Rechercher un cinéma..."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-cinema-darkGray text-white border-cinema-gray">
          <DialogHeader>
            <DialogTitle>
              {selectedTheatre ? "Modifier le cinéma" : "Ajouter un cinéma"}
            </DialogTitle>
          </DialogHeader>
          <TheatersForm
            theatre={selectedTheatre}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TheatersPage;
