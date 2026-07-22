import { NextResponse } from "next/server";
import { smileRequest } from "@/lib/smile";

export async function GET() {
  try {
    const result = await smileRequest("/smilecoin/api/querypoints", {
      product: "mobilelegends",
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
