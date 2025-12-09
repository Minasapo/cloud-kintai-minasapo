const DEFAULT_SECRET = "default_secret";

function base64Encode(buffer: ArrayBuffer) {
  return btoa(
    Array.from(new Uint8Array(buffer))
      .map((byte) => String.fromCharCode(byte))
      .join("")
  );
}

export async function generateOfficeQrToken(timestamp: number) {
  const secret = import.meta.env.VITE_TOKEN_SECRET || DEFAULT_SECRET;
  const encoder = new TextEncoder();
  const data = encoder.encode(`${timestamp}:${secret}`);

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
  const signature = base64Encode(signatureBuffer);

  return btoa(`${timestamp}:${signature}`);
}
