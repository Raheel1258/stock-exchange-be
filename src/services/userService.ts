import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export const GenerateAccessToken = async (email: string): Promise<string> => {
  return jwt.sign({ email }, config.ACCESS_TOKEN_SECRET, { expiresIn: "365d" });
};

export const GenerateRefreshToken = async (email: string): Promise<string> => {
  return jwt.sign({ email }, config.REFRESH_TOKEN_SECRET, {
    expiresIn: "365d",
  });
};

export const ComparePassword = async (
  candidatePassword: string,
  userPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, userPassword);
    return isMatch;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error comparing passwords"
    );
  }
};
