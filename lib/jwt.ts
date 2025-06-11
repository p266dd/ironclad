import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { type SessionPayload } from "@/lib/session";

// Type Definitions
export interface ResetTokenPayload extends JWTPayload {
  id: string;
}

// Validate JWT_SECRET at load time.
if (!process.env.JWT_SECRET) {
  throw new Error("Missing secret environment variable.");
}

// Encode the secret at load time.
const jwtSecret: Uint8Array = new TextEncoder().encode(process.env.JWT_SECRET);

const SESSION_EXPIRATION_DAYS = 30; // Expiration in days

/**
 * Encrypts a given payload into a JWT.
 * @param payload The data to be stored in the JWT.
 * @returns A Promise that resolves to the signed JWT string.
 */
export async function encrypt(payload: SessionPayload): Promise<string> {
  // Calculate expiration dynamically for each token, relative to its issuance.
  const expirationTime =
    Math.floor(Date.now() / 1000) + SESSION_EXPIRATION_DAYS * 24 * 60 * 60;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(jwtSecret);
}

/**
 * Decrypts a JWT session string and returns its payload.
 * Throws an error if the token is invalid, expired, or malformed.
 * @param session The JWT string to decrypt.
 * @returns A Promise that resolves to the decrypted payload.
 */
export async function decrypt(session: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.id === "string" &&
      typeof payload.name === "string" &&
      typeof payload.email === "string" &&
      (payload.role === "user" || payload.role === "admin")
    ) {
      // Type assert to defined SessionPayload interface.
      return payload as SessionPayload;
    }

    console.warn("Decrypted JWT payload did not match expected structure:", payload);
    return null;
  } catch (error) {
    console.error("JWT decryption failed:", error);
    return null;
  }
}

/**
 * Decrypts a Reset JWT token string and returns its payload.
 * Throws an error if the token is invalid, expired, or malformed.
 * @param session The JWT string to decrypt.
 * @returns A Promise that resolves to the decrypted payload.
 */
export async function decryptResetToken(
  token: string
): Promise<ResetTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret, {
      algorithms: ["HS256"],
    });

    if (typeof payload.id === "string") {
      // Type assert to defined SessionPayload interface.
      return payload as ResetTokenPayload;
    }

    console.warn(
      "Decrypted Reset JWT payload did not match expected structure:",
      payload
    );
    return null;
  } catch (error) {
    console.error("JWT decryption failed:", error);
    return null;
  }
}
