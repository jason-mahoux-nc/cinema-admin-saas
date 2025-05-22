
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: Extract<keyof T, string>;
    cell?: (item: T) => React.ReactNode;
  }[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  searchPlaceholder?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  addButtonLabel = "Ajouter",
  searchPlaceholder = "Rechercher...",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm dark:bg-cinema-darkGray dark:border-cinema-gray/40"
        />
        {onAdd && (
          <Button onClick={onAdd} className="bg-cinema-yellow text-black hover:bg-cinema-yellow/90">
            <Plus className="mr-2 h-4 w-4" /> {addButtonLabel}
          </Button>
        )}
      </div>
      <div className="rounded-md border dark:border-cinema-gray/40 dark:bg-cinema-darkGray">
        <Table>
          <TableHeader>
            <TableRow className="dark:border-cinema-gray/40">
              {columns.map((column) => (
                <TableHead key={String(column.accessorKey)}>
                  {column.header}
                </TableHead>
              ))}
              {(onEdit || onDelete) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="text-center h-24 text-white hover:text-black"
                >
                  Aucune donnée disponible
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id} className="dark:border-cinema-gray/40">
                  {columns.map((column) => (
                    <TableCell key={`${item.id}-${String(column.accessorKey)}`}>
                      {column.cell
                        ? column.cell(item)
                        : String(item[column.accessorKey] || "")}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="h-8 dark:border-cinema-gray/40 dark:text-white hover:dark:bg-cinema-gray/40"
                          >
                            Modifier
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(item)}
                            className="h-8"
                          >
                            Supprimer
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
