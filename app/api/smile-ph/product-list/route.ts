import { NextRequest, NextResponse } from "next/server";
import { smileRequest } from "@/lib/smile";

const ALLOWED_PRODUCTS = [
  "mobilelegends",
  "magicchessgogo",
];

export async function GET(req: NextRequest) {
  try {
    const product =
      req.nextUrl.searchParams.get("product") || "mobilelegends";

    if (!ALLOWED_PRODUCTS.includes(product)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported Smile.One product",
        },
        { status: 400 }
      );
    }

    const result = await smileRequest(
      "/smilecoin/api/productlist",
      { product }
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
