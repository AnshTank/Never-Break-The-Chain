import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

function validateAndSanitizeInput(
  email: any,
  password: any
): { email: string; password: string } | null {
  if (typeof email !== "string" || typeof password !== "string") {
    return null;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return null;
  }

  return {
    email: email.trim().toLowerCase(),
    password: password,
  };
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, reason, feedback } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const sanitizedInputs = validateAndSanitizeInput(email, password);
    if (!sanitizedInputs) {
      return NextResponse.json(
        { error: "Invalid email or password format" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    // Find user
    const user = await users.findOne({ email: sanitizedInputs.email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    if (user.password) {
      const isValidPassword = await bcrypt.compare(
        sanitizedInputs.password,
        user.password
      );
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }
    }

    const userId = user._id.toString();

    // Store deletion feedback if provided
    if (reason || feedback) {
      await db.collection("deletionFeedback").insertOne({
        userId,
        email: user.email,
        reason: reason || null,
        feedback: feedback || null,
        deletedAt: new Date(),
      });
    }

    // Delete all user data
    await Promise.all([
      db.collection("users").deleteOne({ _id: user._id }),
      // Delete by email for collections that might use email instead of userId
      db.collection("userSettings").deleteMany({ userId: `${user.email}` }),
      db.collection("dailyProgress").deleteMany({ userId: `${user.email}` }),
      db.collection("timerSessions").deleteMany({ userId: `${user.email}` }),
    ]);

    // Clear cookies
    const response = NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );

    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("refresh-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    // Add cache clearing header
    response.headers.set('X-Clear-Cache', 'true');

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
