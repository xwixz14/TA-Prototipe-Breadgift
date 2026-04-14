import React from "react";
import SuccessComponent from "@/component/pages/cart/SuccessComponent";
import { getTransactionById } from "@/lib/actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Pesanan Berhasil - BreadGift",
};

export default async function SuccessPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string }> 
}) {
  const { id } = await searchParams;

  if (!id) {
    return <SuccessComponent transaction={null} />;
  }

  const transactionId = parseInt(id);
  if (isNaN(transactionId)) {
    return <SuccessComponent transaction={null} />;
  }

  const transaction = await getTransactionById(transactionId);

  return <SuccessComponent transaction={transaction} />;
}
