// app/api/shipping/route.ts
import { NextResponse } from "next/server";
import { DistanceService } from "@/lib/shipping/distance-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city")!;
  const state = searchParams.get("state")!;

  const coldPrice = await DistanceService.calculate(city, state);

  return NextResponse.json({
    cold: {
      name: "Entrega Cold Breeze",
      price: coldPrice,
      deadline: "1-2 dias úteis",
    },
    sedex: {
      name: "SEDEX",
      price: 34.9,
      deadline: "1 dia útil",
    },
    pac: {
      name: "PAC (Correios)",
      price: 24.9,
      deadline: "5-8 dias úteis",
    },
  });
}
