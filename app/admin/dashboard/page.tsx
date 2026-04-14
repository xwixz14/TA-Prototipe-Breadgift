import React from "react";
import DashboardContainer from "./DashboardContainer";
import { getProducts } from "@/lib/actions";

export default async function DashboardPage() {
  const initialProducts = await getProducts("Aktif");

  return (
    <div className="flex w-full h-full gap-8">
      <DashboardContainer initialProducts={initialProducts} />
    </div>
  );
}
