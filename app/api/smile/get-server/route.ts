import crypto from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const email = process.env.SMILE_EMAIL;
    const uid = process.env.SMILE_UID;
    const key = process.env.SMILE_API_KEY;

    if (!email || !uid || !key) {
      throw new Error("Smile.One credentials are missing");
    }

    const data: Record<string, string> = {
      email,
      product: "mobilelegends",
      time: Math.floor(Date.now() / 1000).toString(),
      uid,
    };

    const signText =
      Object.keys(data)
        .sort()
        .map((name) => `${name}=${data[name]}&`)
        .join("") + key;

    const sign = crypto
      .createHash("md5")
      .update(crypto.createHash("md5").update(signText).digest("hex"))
      .digest("hex");

    const form = new FormData();

    for (const [name, value] of Object.entries(data)) {
      form.append(name, value);
    }

    form.append("sign", sign);

    const response = await fetch(
      "https://www.smile.one/br/smilecoin/api/getserver",
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
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
