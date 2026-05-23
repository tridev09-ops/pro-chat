'use server';

import mongoose from "mongoose";
import connectDB from "./db/db";
import User from "./db/models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type ActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function signup(form: any): Promise<ActionResponse> {
  const name = form.name as string;
  const email = form.email as string;
  const password = form.password as string;
  const emoji = form.emoji as string;

  if (!name || !email || !password) {
    return { success: false, error: "All fields are required" };
  }

  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { success: false, error: "User already exists" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    emoji,
  });

  // Create JWT
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return { success: true, message: "Signup successful" };
}

export async function login(form: any): Promise<ActionResponse> {
  const email = form.email as string;
  const password = form.password as string;

  if (!email || !password) {
    return { success: false, error: "All fields are required" };
  }

  await connectDB();

  const user = await User.findOne({ email });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { success: false, error: "Invalid password" };
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return { success: true, message: "Login successful" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  redirect("/auth/login");
}

