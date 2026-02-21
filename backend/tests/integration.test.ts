import { describe, test, expect } from "bun:test";
import { api, authenticatedApi, signUpTestUser, expectStatus, connectWebSocket, connectAuthenticatedWebSocket, waitForMessage } from "./helpers";

describe("API Integration Tests", () => {
  // Shared state for chaining tests (e.g., created resource IDs, auth tokens)
  let hackathonId: string;

  describe("Hackathons", () => {
    test("Get all hackathons (empty or populated list)", async () => {
      const res = await api("/api/hackathons");
      await expectStatus(res, 200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test("Create a hackathon with required fields", async () => {
      const res = await api("/api/hackathons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Hackathon",
          description: "A test hackathon event",
          location: "San Francisco",
          startDate: "2026-03-01T10:00:00Z",
          endDate: "2026-03-02T18:00:00Z",
          prize: "$5000",
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe("Test Hackathon");
      expect(data.description).toBe("A test hackathon event");
      expect(data.location).toBe("San Francisco");
      expect(data.prize).toBe("$5000");
      hackathonId = data.id;
    });

    test("Create a hackathon with all fields including optional ones", async () => {
      const res = await api("/api/hackathons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Complete Hackathon",
          description: "A hackathon with all fields",
          location: "New York",
          startDate: "2026-04-01T09:00:00Z",
          endDate: "2026-04-02T17:00:00Z",
          prize: "$10000",
          participants: 150,
          imageUrl: "https://example.com/image.jpg",
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.participants).toBe(150);
      expect(data.imageUrl).toBe("https://example.com/image.jpg");
    });

    test("Create a hackathon without required field should fail", async () => {
      const res = await api("/api/hackathons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Incomplete Hackathon",
          description: "Missing required fields",
          location: "Boston",
          // Missing startDate, endDate, and prize
        }),
      });
      await expectStatus(res, 400);
    });

    test("Get hackathon by ID", async () => {
      const res = await api(`/api/hackathons/${hackathonId}`);
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.id).toBe(hackathonId);
      expect(data.name).toBe("Test Hackathon");
    });

    test("Get hackathon with non-existent UUID should return 404", async () => {
      const res = await api("/api/hackathons/00000000-0000-0000-0000-000000000000");
      await expectStatus(res, 404);
    });

    test("Get hackathon with invalid UUID format should fail", async () => {
      const res = await api("/api/hackathons/invalid-uuid");
      await expectStatus(res, 400);
    });

    test("List hackathons should include created hackathon", async () => {
      const res = await api("/api/hackathons");
      await expectStatus(res, 200);
      const data = await res.json();
      const found = data.some((h: any) => h.id === hackathonId);
      expect(found).toBe(true);
    });
  });
});
