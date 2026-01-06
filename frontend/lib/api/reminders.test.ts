import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
} from "./reminders";
import { apiClient } from "./client";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Reminders API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getReminders", () => {
    it("should fetch all reminders without filters", async () => {
      const mockReminders = [
        { id: "1", title: "Reminder 1" },
        { id: "2", title: "Reminder 2" },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockReminders });

      const result = await getReminders();

      expect(apiClient.get).toHaveBeenCalledWith("/api/reminders/", {
        params: {},
      });
      expect(result).toEqual(mockReminders);
    });

    it("should fetch reminders with status filter", async () => {
      const mockReminders = [{ id: "1", title: "Scheduled Reminder" }];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockReminders });

      const result = await getReminders({ status: "scheduled" });

      expect(apiClient.get).toHaveBeenCalledWith("/api/reminders/", {
        params: { status: "scheduled" },
      });
      expect(result).toEqual(mockReminders);
    });

    it("should fetch reminders with search query", async () => {
      const mockReminders = [{ id: "1", title: "Meeting" }];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockReminders });

      const result = await getReminders({ search: "meeting" });

      expect(apiClient.get).toHaveBeenCalledWith("/api/reminders/", {
        params: { search: "meeting" },
      });
      expect(result).toEqual(mockReminders);
    });
  });

  describe("getReminder", () => {
    it("should fetch a single reminder by id", async () => {
      const mockReminder = { id: "123", title: "Test Reminder" };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockReminder });

      const result = await getReminder("123");

      expect(apiClient.get).toHaveBeenCalledWith("/api/reminders/123");
      expect(result).toEqual(mockReminder);
    });
  });

  describe("createReminder", () => {
    it("should create a new reminder", async () => {
      const newReminder = {
        title: "New Reminder",
        message: "Test message",
        phone_number: "+15551234567",
        scheduled_for: "2024-01-15T10:00:00Z",
        timezone: "America/New_York",
      };

      const mockResponse = { id: "456", ...newReminder };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await createReminder(newReminder);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/reminders/",
        newReminder,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateReminder", () => {
    it("should update an existing reminder", async () => {
      const updates = { title: "Updated Title" };
      const mockResponse = { id: "789", title: "Updated Title" };

      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockResponse });

      const result = await updateReminder("789", updates);

      expect(apiClient.patch).toHaveBeenCalledWith(
        "/api/reminders/789",
        updates,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteReminder", () => {
    it("should delete a reminder", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: null });

      await deleteReminder("999");

      expect(apiClient.delete).toHaveBeenCalledWith("/api/reminders/999");
    });
  });
});
