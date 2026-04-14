import { NextResponse } from "next/server";
import { handleMidtransNotification } from "@/lib/midtrans-server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    console.log("Midtrans Notification Received:", payload.order_id, payload.transaction_status);
    
    const result = await handleMidtransNotification(payload);
    
    if (result.success) {
      return NextResponse.json({ status: "OK" }, { status: 200 });
    } else {
      return NextResponse.json({ status: "Error", message: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Callback API Error:", error);
    return NextResponse.json({ status: "Error" }, { status: 500 });
  }
}
