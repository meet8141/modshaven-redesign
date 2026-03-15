import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export type UserRole = "USER" | "MODERATOR" | "ADMIN";

export interface UserPayload extends JWTPayload {
  _id: string;
  email: string;
  profileImageURL: string;
  role: UserRole;
}

function getJwtConfig() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be defined and at least 32 characters long");
  }

  return {
    secret: new TextEncoder().encode(jwtSecret),
    issuer: process.env.JWT_ISSUER ?? "modshaven.com",
    audience: process.env.JWT_AUDIENCE ?? "modshaven-users",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  };
}

export async function createTokenForUser(user: {
  _id: unknown;
  email: string;
  profileImageURL: string;
  role: UserRole;
}): Promise<string> {
  const { secret, issuer, audience, expiresIn } = getJwtConfig();

  return new SignJWT({
    _id: String(user._id),
    email: user.email,
    profileImageURL: user.profileImageURL,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function validateToken(token: string): Promise<UserPayload> {
  const { secret, issuer, audience } = getJwtConfig();
  const { payload } = await jwtVerify(token, secret, {
    issuer,
    audience,
  });

  return payload as UserPayload;
}
