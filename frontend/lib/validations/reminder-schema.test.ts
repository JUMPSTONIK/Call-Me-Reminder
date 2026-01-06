import { describe, it, expect } from "vitest";
import { reminderSchema } from "./reminder-schema";

describe("Reminder Schema Validation", () => {
  const validData = {
    title: "Test Reminder",
    phoneNumber: "+15551234567",
    scheduledFor: new Date(Date.now() + 3600000),
    timezone: "America/New_York",
    message: "This is a test message for the reminder",
  };

  describe("title validation", () => {
    it("should accept valid title", () => {
      const result = reminderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject title shorter than 3 characters", () => {
      const data = { ...validData, title: "AB" };
      const result = reminderSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 3 characters");
      }
    });

    it("should reject title longer than 100 characters", () => {
      const data = { ...validData, title: "A".repeat(101) };
      const result = reminderSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("less than 100 characters");
      }
    });
  });

  describe("phoneNumber validation", () => {
    it("should accept valid E.164 phone number", () => {
      const data = { ...validData, phoneNumber: "+15551234567" };
      const result = reminderSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject phone number without + prefix", () => {
      const data = { ...validData, phoneNumber: "15551234567" };
      const result = reminderSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("E.164 format");
      }
    });

    it("should reject phone number with invalid format", () => {
      const data = { ...validData, phoneNumber: "+1-555-123-4567" };
      const result = reminderSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept international phone numbers", () => {
      const data = { ...validData, phoneNumber: "+442071234567" };
      const result = reminderSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("message validation", () => {
    it("should accept valid message", () => {
      const result = reminderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject message shorter than 10 characters", () => {
      const data = { ...validData, message: "Short" };
      const result = reminderSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 10 characters");
      }
    });

    it("should reject message longer than 500 characters", () => {
      const data = { ...validData, message: "A".repeat(501) };
      const result = reminderSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("less than 500 characters");
      }
    });
  });

  describe("scheduledFor validation", () => {
    it("should accept future date", () => {
      const futureDate = new Date(Date.now() + 3600000);
      const data = { ...validData, scheduledFor: futureDate };
      const result = reminderSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept Date object", () => {
      const result = reminderSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.scheduledFor).toBeInstanceOf(Date);
      }
    });
  });

  describe("timezone validation", () => {
    it("should accept valid timezone", () => {
      const data = { ...validData, timezone: "America/New_York" };
      const result = reminderSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject empty timezone", () => {
      const data = { ...validData, timezone: "" };
      const result = reminderSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("select a timezone");
      }
    });
  });

  describe("complete validation", () => {
    it("should validate complete valid reminder", () => {
      const result = reminderSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty("title");
        expect(result.data).toHaveProperty("phoneNumber");
        expect(result.data).toHaveProperty("scheduledFor");
        expect(result.data).toHaveProperty("timezone");
        expect(result.data).toHaveProperty("message");
      }
    });
  });
});
