import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  authenticateRequest,
  requireAnyRole,
  type AccessTokenVerifier,
} from "../src/auth/authorization";

const verifier: AccessTokenVerifier = {
  async verify(token) {
    if (token !== "valid-test-token") throw new AuthenticationError("Token inválido.");
    return { subject: "user-1", provider: "test" };
  },
};

describe("authorization boundary", () => {
  it("denies requests without a bearer token", async () => {
    await expect(
      authenticateRequest({ headers: {} }, verifier),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("keeps role checks independent from the identity provider", async () => {
    await authenticateRequest(
      { headers: { authorization: "Bearer valid-test-token" } },
      verifier,
    );

    expect(() => requireAnyRole("seller", ["seller"])).not.toThrow();
    expect(() => requireAnyRole("seller", ["admin"])).toThrow(
      "O perfil não possui permissão",
    );
  });
});
