import crypto from "crypto";

const EMAIL = process.env.SMILE_EMAIL!;
const UID = process.env.SMILE_UID!;
const KEY = process.env.SMILE_API_KEY!;

export async function smileRequest(
  endpoint: string,
  params: Record<string, string>
) {
  const data: Record<string, string> = {
    email: EMAIL,
    uid: UID,
    time: Math.floor(Date.now() / 1000).toString(),
    ...params,
  };

  const signText =
    Object.keys(data)
      .sort()
      .map((k) => `${k}=${data[k]}&`)
      .join("") + KEY;

  const sign = crypto
    .createHash("md5")
    .update(
      crypto.createHash("md5").update(signText).digest("hex")
    )
    .digest("hex");

  const form = new FormData();

  Object.entries(data).forEach(([k, v]) => form.append(k, v));
  form.append("sign", sign);

  const res = await fetch(`https://www.smile.one/br${endpoint}`, {
    method: "POST",
    body: form,
    cache: "no-store",
  });

  return await res.json();
}
