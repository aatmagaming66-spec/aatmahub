import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const allowedProducts: Record<string, string> = {
  mobilelegends: "13",
  magicchessgogo: "23825",
};

export async function GET(req: NextRequest) {
  try {
    const email = process.env.SMILE_EMAIL;
    const uid = process.env.SMILE_UID;
    const key = process.env.SMILE_API_KEY;

    if (!email || !uid || !key) {
      throw new Error("Smile.One credentials are missing");
    }

    const userid = req.nextUrl.searchParams.get("userid")?.trim() || "";
    const zoneid = req.nextUrl.searchParams.get("zoneid")?.trim() || "";
    const product =
      req.nextUrl.searchParams.get("product")?.trim() || "mobilelegends";

    if (!userid || !zoneid) {
      return NextResponse.json(
        {
          status: 400,
          message: "Player ID and Server ID are required",
        },
        { status: 400 }
      );
    }

    const productid = allowedProducts[product];

    if (!productid) {
      return NextResponse.json(
        {
          status: 400,
          message: "Unsupported product",
        },
        { status: 400 }
      );
    }

    const data: Record<string, string> = {
      email,
      uid,
      userid,
      zoneid,
      product,
      productid,
      time: Math.floor(Date.now() / 1000).toString(),
    };

    const signText =
      Object.keys(data)
        .sort()
        .map((keyName) => `${keyName}=${data[keyName]}&`)
        .join("") + key;

    const sign = crypto
      .createHash("md5")
      .update(
        crypto.createHash("md5").update(signText).digest("hex")
      )
      .digest("hex");

    const form = new FormData();

    Object.entries(data).forEach(([keyName, value]) => {
      form.append(keyName, value);
    });

    form.append("sign", sign);

    const response = await fetch(
      "https://www.smile.one/ph/smilecoin/api/getrole",
      {
        method: "POST",
        body: form,
        cache: "no-store",
      }
    );

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ||
          "application/json",
      },
    });
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
