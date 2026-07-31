import { createRemoteJWKSet, errors, jwtVerify } from "jose";
import {
  AuthenticationError,
  IdentityProviderUnavailableError,
  type AccessTokenVerifier,
  type AuthPrincipal,
} from "./authorization";

type OidcVerifierOptions = {
  issuer: string;
  audience: string;
  jwksUrl: string;
};

export class OidcAccessTokenVerifier implements AccessTokenVerifier {
  private readonly issuer: string;
  private readonly audience: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor({ issuer, audience, jwksUrl }: OidcVerifierOptions) {
    this.issuer = issuer;
    this.audience = audience;
    this.jwks = createRemoteJWKSet(new URL(jwksUrl), {
      timeoutDuration: 5_000,
      cooldownDuration: 30_000,
      cacheMaxAge: 10 * 60_000,
    });
  }

  async verify(token: string): Promise<AuthPrincipal> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ["RS256"],
      });

      if (!payload.sub) throw new AuthenticationError("Token sem identificação de usuário.");

      return {
        subject: payload.sub,
        provider: this.issuer,
        email: typeof payload.email === "string" ? payload.email : undefined,
        phoneNumber:
          typeof payload.phone_number === "string" ? payload.phone_number : undefined,
        displayName: typeof payload.name === "string" ? payload.name : undefined,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      if (
        error instanceof errors.JWTClaimValidationFailed ||
        error instanceof errors.JWTExpired ||
        error instanceof errors.JOSEError
      ) {
        throw new AuthenticationError("Token de acesso inválido ou expirado.");
      }
      throw new IdentityProviderUnavailableError(
        "Não foi possível validar a identidade neste momento.",
      );
    }
  }
}

export class UnavailableAccessTokenVerifier implements AccessTokenVerifier {
  async verify(): Promise<AuthPrincipal> {
    throw new IdentityProviderUnavailableError(
      "O provedor de identidade ainda não foi configurado neste ambiente.",
    );
  }
}
