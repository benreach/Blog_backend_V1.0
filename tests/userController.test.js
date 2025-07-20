import { jest } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import request from "supertest";
jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn().mockResolvedValue("hashedPassword"),
    compare: jest.fn().mockResolvedValue(true),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn().mockReturnValue("mockToken"),
  },
}));



const bcrypt = (await import("bcrypt")).default;
const jwt = (await import("jsonwebtoken")).default;
const appModule = await import("../server.js");
const app = appModule.default;
// Now you can use mockResolvedValue safely


const prisma = new PrismaClient();


describe("User Controller", () => {
  beforeAll(async () => {
    // Delete dependent records first due to foreign key constraints
    await prisma.adminProfile.deleteMany(); // delete AdminProfiles first
    await prisma.user.deleteMany(); // then delete Users
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/users/register", () => {
    it("should register a new user", async () => {
      bcrypt.hash.mockResolvedValue("hashedPassword");

      const res = await request(app)
        .post("/api/users/register")
        .send({
          displayName: "Test User",
          email: "test@example.com",
          password: "Benjamin1234$%",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "User created successfully");
      expect(res.body.user).toHaveProperty("displayName", "Test User");
      expect(bcrypt.hash).toHaveBeenCalledWith("Benjamin1234$%", 10);
    });

    it("should fail if user already exists", async () => {
      // Create user first
      await prisma.user.create({
        data: {
          displayName: "Ben jamin",
          email: "Benjaminkok@gmail.com",
          password: "Benjamin1234$%",
        },
      });

      const res = await request(app)
        .post("/api/users/register")
        .send({
          displayName: "Ben jamin",
          email: "Benjaminkok@gmail.com",
          password: "Benjamin1234$%",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "User already exists");
    });
  });

  describe("POST /api/users/login", () => {
    it("should login an existing user", async () => {
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockToken");

      // Ensure user exists in DB
      await prisma.user.create({
        data: {
          displayName: "Login User",
          email: "login@example.com",
          password: "hashedPassword",
        },
      });

      const res = await request(app)
        .post("/api/users/login")
        .send({ email: "login@example.com", password: "password123" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token", "mockToken");
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
    });

    it("should fail login with invalid credentials", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({ email: "nonexistent@example.com", password: "password123" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });
  });

  describe("GET /api/users", () => {
    it("should get all users", async () => {
      const res = await request(app).get("/api/users");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("PUT /api/users/:userId", () => {
    it("should update user info if allowed", async () => {
      // Create user to update
      const user = await prisma.user.create({
        data: {
          displayName: "ToUpdate",
          email: "update@example.com",
          password: "irrelevant",
          lastProfileUpdate: null,
        },
      });

      const res = await request(app)
        .put(`/api/users/${user.id}`)
        .send({ firstName: "Updated", displayName: "Updated Name" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "User updated successfully.");
      expect(res.body.user).toHaveProperty("firstName", "Updated");
      expect(res.body.user).toHaveProperty("displayName", "Updated Name");
    });

    it("should prevent update if lastProfileUpdate < 7 days ago", async () => {
      // Create user with recent lastProfileUpdate
      const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const user = await prisma.user.create({
        data: {
          displayName: "NoUpdate",
          email: "noupdate@example.com",
          password: "irrelevant",
          lastProfileUpdate: recentDate,
        },
      });

      const res = await request(app)
        .put(`/api/users/${user.id}`)
        .send({ firstName: "FailUpdate" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(
        /អ្នកអាចធ្វើកំណែបានម្តងក្នុងមួយសប្តាហ៏។/
      );
    });
  });
});
