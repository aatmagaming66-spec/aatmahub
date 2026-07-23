import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const email = process.env.SMILE_EMAIL;
    const uid = process.env.SMILE_UID;
    const key = process.env.SMILE_API_KEY;

    if (!email || !uid || !key) {
      throw new Error("Smile.One credentials are missing");
    }

    const body = await req.json();

    const userid = String(body.userid || "").trim();
    const zoneid = String(body.zoneid || "").trim();
    const productid = String(body.productid || "").trim();

    if (!userid || !zoneid || !productid) {
      return NextResponse.json(
        {
          success: false,
          error: "userid, zoneid and productid are required",
        },
        { status: 400 }
      );
    }

    const data: Record<string, string> = {
      email,
      uid,
      userid,
      zoneid,
      product: "mobilelegends",
      productid,
      time: Math.floor(Date.now() / 1000).toString(),
    };

    const signText =
      Object.keys(data)
        .sort()
        .map((keyName) => `${keyName}=${data[keyName]}&`)
        .join("") + key;

    const firstMd5 = crypto
      .createHash("md5")
      .update(signText)
      .digest("hex");

    const sign = crypto
      .createHash("md5")
      .update(firstMd5)
      .digest("hex");

    const form = new FormData();

    for (const [name, value] of Object.entries(data)) {
      form.append(name, value);
    }

    form.append("sign", sign);

    const response = await fetch(
      "https://www.smile.one/ph/smilecoin/api/createorder",
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
