'use server';
import connectDB from "@/lib/db/db";
import User from "@/lib/db/models/userModel";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { serializeData } from "@/lib/serialize";

export async function getCurrentUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        return decoded.userId.toString();
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null;
    }
}

export async function fetchUsers() {
    await connectDB();
    const users = await User.find().select('-password').lean();
    return serializeData(users);
}

export async function getUserById(id: string) {
    await connectDB();
    const user = await User.findById(id).select('-password').lean();
    return serializeData(user);
}

