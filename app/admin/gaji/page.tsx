import React from "react";
import GajiManager from "@/component/admin/gaji/GajiManager";
import { getSalaries } from "@/lib/actions";

export const metadata = {
  title: "Gaji Karyawan - Admin BreadGift",
};

export default async function GajiPage() {
  const initialSalaries = await getSalaries();

  return (
    <div className="flex-1 h-full overflow-hidden">
      <GajiManager initialSalaries={initialSalaries} />
    </div>
  );
}
