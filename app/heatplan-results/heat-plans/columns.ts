"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type interface defines the shape of our data.
export interface HeatPlan {
  Grade: string
  Width: number
  NoOfSlabs: string
  Quantity: number
  NoOfHeat: number
}

export const columns: ColumnDef<HeatPlan>[] = [
  {
    accessorKey: "Grade",
    header: "Grade",
  },
  {
    accessorKey: "Width",
    header: "Width",
  },
  {
    accessorKey: "NoOfSlabs",
    header: "No. of Slabs",
  },
  {
    accessorKey: "Quantity",
    header: "Quantity",
  },
  {
    accessorKey: "NoOfHeat",
    header: "No. of Heat",
  },
] 