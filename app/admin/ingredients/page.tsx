import React from "react";
import IngredientManager from "@/component/admin/ingredients/IngredientManager";

export const metadata = {
  title: "Stok Bahan Baku - Admin BreadGift",
};

export default function IngredientsPage() {
  return (
    <div className="flex-1 h-fit">
      <IngredientManager />
    </div>
  );
}
