import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function POST(request: Request) {
  try {
    // Parse the email from request body
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    // Call Better Auth to resend verification email
    await auth.api.sendVerificationEmail({
      body: {
        email,
        callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/verified-email`,
      },
    });

    // Respond with success
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Resend verification error:", error);

    return NextResponse.json(
      { success: false, message: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
