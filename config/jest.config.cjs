import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default {
  testEnvironment: "node",
  transform: {},
  extensionsToTreatAsEsm: [".js"],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
