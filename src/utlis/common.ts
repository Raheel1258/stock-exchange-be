import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
const User = require("../models/user");
const admin = require("firebase-admin");

import { config } from "../config/config";
import { OTP_EMAIL_SUBJECT, OTP_LENGTH } from "./constants";

export const GenerateOtpNumber = async (): Promise<string> => {
  return otpGenerator.generate(OTP_LENGTH, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};
export const SendEmail = async (
  firstName: string,
  email: string,
  otpToken: string
): Promise<any> => {
  const transporter = nodemailer.createTransport({
    service: config.EMAIL_SERVER,
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: config.EMAIL_SENDING_ID,
      pass: config.EMAIL_SENDING_PWD,
    },
  });

  const mailOptions = {
    from: config.EMAIL_SENDING_ID,
    to: email,
    subject: OTP_EMAIL_SUBJECT,
    html: `<p>Hi, ${firstName}<br />
        Your one-time passcode is <strong>${otpToken}</strong>.
        <br /><br /> Please use this code to complete your verification process.
        <br /> If you didn’t request this code or need assistance, feel free to contact our support team.
        <br /><br />Best Regards,
        <br />Boarderline Team</p>
        <br/>`,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

// export const GetUserIdFromToken = async (
//   paramAccessToken: string | undefined
// ): Promise<typeof User | null> => {
//   if (!paramAccessToken) {
//     return null;
//   }
//   try {
//     const decodedToken = jwt.verify(
//       paramAccessToken,
//       config.ACCESS_TOKEN_SECRET
//     ) as jwt.JwtPayload;

//     const email = decodedToken.email;

//     const user = await User.findOne({ email });

//     return user;
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return null;
//   }
// };

export async function GetUserIdFromToken(token: string | undefined) {
  if (!token) {
    return undefined;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    const user = await User.findOne({ email: decodedToken.email });

    if (!user && !decodedToken.email) {
      return undefined;
    } else if (decodedToken.email && !user) {
      const payload = {
        email: decodedToken.email,
        firebaseId: decodedToken.uid,
      };

      const saveUser = new User(payload);
      await saveUser.save();

      return saveUser;
    } else {
      return user;
    }
  } catch (error) {
    return undefined;
  }
}

export const GetAccessToken = (req: Request): string | undefined => {
  return req.headers.authorization
    ? req.headers.authorization.replace("Bearer ", "")
    : undefined;
};

export const CalculateDaysDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
