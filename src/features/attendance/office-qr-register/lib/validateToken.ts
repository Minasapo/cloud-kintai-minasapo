import dayjs from "dayjs";

const TOKEN_TTL_SECONDS = 30;

export async function validateOfficeQrToken(
  timestamp: string | null,
  token: string | null
) {
  if (!timestamp || !token) {
    return false;
  }

  try {
    const secret = import.meta.env.VITE_TOKEN_SECRET;
    if (!secret) {
      console.error("VITE_TOKEN_SECRET is not set.");
      throw new Error("VITE_TOKEN_SECRET is not defined or invalid.");
    }

    const decoded = atob(token);
    const [receivedTimestamp, receivedSignature] = decoded.split(":");

    if (receivedTimestamp !== timestamp) {
      return false;
    }

    const currentTimestamp = dayjs().unix();
    const timestampNumber = Number(timestamp);
    if (Number.isNaN(timestampNumber)) {
      return false;
    }

    if (currentTimestamp - timestampNumber >= TOKEN_TTL_SECONDS) {
      return false;
    }

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
    const expectedSignature = btoa(
      Array.from(new Uint8Array(signatureBuffer))
        .map((byte) => String.fromCharCode(byte))
        .join("")
    );

    return receivedSignature === expectedSignature;
  } catch {
    return false;
  }
}
