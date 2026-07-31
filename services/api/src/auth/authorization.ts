import type { FastifyRequest } from "fastify";
import type { UserRole } from "@ta-passando/contracts";

export type AuthPrincipal = {
  subject: string;
  provider: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
};

export interface AccessTokenVerifier {
  verify(token: string): Promise<AuthPrincipal>;
}

export class AuthenticationError extends Error {
  readonly statusCode = 401;
  readonly code = "AUTHENTICATION_REQUIRED";
}

export class AuthorizationError extends Error {
  readonly statusCode = 403;
  readonly code = "INSUFFICIENT_ROLE";
}

export class IdentityProviderUnavailableError extends Error {
  readonly statusCode = 503;
  readonly code = "IDENTITY_PROVIDER_UNAVAILABLE";
}

export async function authenticateRequest(
  request: Pick<FastifyRequest, "headers">,
  verifier: AccessTokenVerifier,
): Promise<AuthPrincipal> {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    throw new AuthenticationError("Token de acesso ausente.");
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    throw new AuthenticationError("Token de acesso ausente.");
  }

  return verifier.verify(token);
}

export function requireAnyRole(
  role: UserRole,
  allowedRoles: readonly UserRole[],
): void {
  if (!allowedRoles.includes(role)) {
    throw new AuthorizationError("O perfil não possui permissão para esta ação.");
  }
}
