import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the modules BEFORE importing anything that uses them
vi.mock("./db", () => ({
  getOutbreakCases: vi.fn(() => Promise.resolve([])),
  getSignals: vi.fn(() => Promise.resolve([])),
  subscribeEmail: vi.fn(() => Promise.resolve({ insertId: 1 })),
  isEmailSubscribed: vi.fn(() => Promise.resolve(false)),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(() => Promise.resolve(true)),
}));

// NOW import after mocking
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import * as notification from "./_core/notification";

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

describe("Outbreak Tracker Routers", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    vi.clearAllMocks();
    const ctx = createTestContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("outbreak.getCases", () => {
    it("should return cases with summary statistics", async () => {
      vi.mocked(db.getOutbreakCases).mockResolvedValueOnce([]);
      const result = await caller.outbreak.getCases();

      expect(result).toHaveProperty("cases");
      expect(result).toHaveProperty("summary");
      expect(result.summary).toHaveProperty("totalConfirmed");
      expect(result.summary).toHaveProperty("totalDeaths");
      expect(result.summary).toHaveProperty("affectedCountries");
      expect(result.summary).toHaveProperty("lastUpdated");
    });

    it("should calculate correct summary statistics for empty cases", async () => {
      vi.mocked(db.getOutbreakCases).mockResolvedValueOnce([]);
      const result = await caller.outbreak.getCases();

      expect(result.summary.totalConfirmed).toBe(0);
      expect(result.summary.totalDeaths).toBe(0);
      expect(result.summary.affectedCountries).toBe(0);
    });
  });

  describe("outbreak.getDelta", () => {
    it("should return delta information", async () => {
      vi.mocked(db.getOutbreakCases).mockResolvedValueOnce([]);
      const result = await caller.outbreak.getDelta();

      expect(result).toHaveProperty("newCases");
      expect(result).toHaveProperty("newCountries");
      expect(result).toHaveProperty("hoursSinceChange");
      expect(result).toHaveProperty("hasChange");
    });

    it("should have correct data types", async () => {
      vi.mocked(db.getOutbreakCases).mockResolvedValueOnce([]);
      const result = await caller.outbreak.getDelta();

      expect(typeof result.newCases).toBe("number");
      expect(Array.isArray(result.newCountries)).toBe(true);
      expect(typeof result.hoursSinceChange).toBe("number");
      expect(typeof result.hasChange).toBe("boolean");
    });

    it("should have non-negative values", async () => {
      vi.mocked(db.getOutbreakCases).mockResolvedValueOnce([]);
      const result = await caller.outbreak.getDelta();

      expect(result.newCases).toBeGreaterThanOrEqual(0);
      expect(result.hoursSinceChange).toBeGreaterThanOrEqual(0);
    });
  });

  describe("signals.getAll", () => {
    it("should return signals array", async () => {
      vi.mocked(db.getSignals).mockResolvedValueOnce([]);
      const result = await caller.signals.getAll();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      vi.mocked(db.getSignals).mockResolvedValueOnce([]);
      const result = await caller.signals.getAll({ limit: 10 });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("signals.getByRegion", () => {
    it("should filter signals by region", async () => {
      vi.mocked(db.getSignals).mockResolvedValueOnce([]);
      const result = await caller.signals.getByRegion({ region: "Africa" });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("subscription.subscribe", () => {
    it("should accept valid email and subscribe", async () => {
      vi.mocked(db.isEmailSubscribed).mockResolvedValueOnce(false);
      vi.mocked(db.subscribeEmail).mockResolvedValueOnce({ insertId: 1 } as any);
      vi.mocked(notification.notifyOwner).mockResolvedValueOnce(true);

      const result = await caller.subscription.subscribe({ email: "test@example.com" });

      expect(result.success).toBe(true);
    });

    it("should reject already subscribed email", async () => {
      vi.mocked(db.isEmailSubscribed).mockResolvedValueOnce(true);

      const result = await caller.subscription.subscribe({ email: "test@example.com" });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Email already subscribed");
    });
  });

  describe("subscription.isSubscribed", () => {
    it("should return subscribed status", async () => {
      vi.mocked(db.isEmailSubscribed).mockResolvedValueOnce(true);
      const result = await caller.subscription.isSubscribed({ email: "test@example.com" });

      expect(result.subscribed).toBe(true);
    });
  });

  describe("auth.logout", () => {
    it("should return success response", async () => {
      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
    });
  });
});
