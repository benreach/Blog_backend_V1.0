import bcrypt from "bcrypt";

describe("bcrypt hashing", () => {
  it("should hash and verify password correctly", async () => {
    const password = "superSecret123!";
    const hashed = await bcrypt.hash(password, 10);

    const isMatch = await bcrypt.compare(password, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare("wrongPass", hashed);
    expect(isWrongMatch).toBe(false);
  });
});
