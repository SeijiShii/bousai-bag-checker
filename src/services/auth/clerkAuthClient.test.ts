import { describe, it, expect, vi, beforeEach } from "vitest";

const { authenticateRequestMock, createClerkClientMock } = vi.hoisted(() => {
  const authMock = vi.fn();
  const clientMock = vi.fn(() => ({ authenticateRequest: authMock }));
  return {
    authenticateRequestMock: authMock,
    createClerkClientMock: clientMock,
  };
});

vi.mock("@clerk/backend", () => ({
  createClerkClient: createClerkClientMock,
}));

import { makeClerkSessionResolver } from "./clerkAuthClient";

function fakeReq() {
  return {
    headers: { authorization: "Bearer xxx" },
    url: "http://x",
    method: "GET",
  };
}

describe("makeClerkSessionResolver (@clerk/backend wrapper)", () => {
  beforeEach(() => {
    authenticateRequestMock.mockReset();
    createClerkClientMock.mockClear();
  });

  it("returns userId when state.status is signed-in", async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      status: "signed-in",
      toAuth: () => ({ userId: "user_abc" }),
    });
    const resolver = makeClerkSessionResolver({ secretKey: "sk_test_xxx" });
    const userId = await resolver.resolveClerkUserId(fakeReq());
    expect(userId).toBe("user_abc");
  });

  it("accepts anonymous user (anon_*) as signed-in", async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      status: "signed-in",
      toAuth: () => ({ userId: "anon_xyz" }),
    });
    const resolver = makeClerkSessionResolver({ secretKey: "sk_test_xxx" });
    expect(await resolver.resolveClerkUserId(fakeReq())).toBe("anon_xyz");
  });

  it("returns null when state.status is signed-out", async () => {
    authenticateRequestMock.mockResolvedValueOnce({ status: "signed-out" });
    const resolver = makeClerkSessionResolver({ secretKey: "sk_test_xxx" });
    expect(await resolver.resolveClerkUserId(fakeReq())).toBeNull();
  });

  it("returns null when state.status is handshake", async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      status: "handshake",
      toAuth: () => null,
    });
    const resolver = makeClerkSessionResolver({ secretKey: "sk_test_xxx" });
    expect(await resolver.resolveClerkUserId(fakeReq())).toBeNull();
  });

  it("returns null on SDK exception without leaking PII", async () => {
    authenticateRequestMock.mockRejectedValueOnce(
      new Error("clerk-internal-error"),
    );
    const resolver = makeClerkSessionResolver({ secretKey: "sk_test_xxx" });
    expect(await resolver.resolveClerkUserId(fakeReq())).toBeNull();
  });

  it("returns null when toAuth() returns no userId", async () => {
    authenticateRequestMock.mockResolvedValueOnce({
      status: "signed-in",
      toAuth: () => ({ userId: null as unknown as string }),
    });
    const resolver = makeClerkSessionResolver({ secretKey: "sk_test_xxx" });
    expect(await resolver.resolveClerkUserId(fakeReq())).toBeNull();
  });

  it("passes secretKey + publishableKey to createClerkClient", () => {
    makeClerkSessionResolver({
      secretKey: "sk_test_abc",
      publishableKey: "pk_test_def",
    });
    expect(createClerkClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        secretKey: "sk_test_abc",
        publishableKey: "pk_test_def",
      }),
    );
  });
});
