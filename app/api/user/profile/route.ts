import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib";
import { decodeToken } from "@/utils/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const decodedToken = decodeToken(token);

  if (!decodedToken) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
  
  const userId = decodedToken.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
  
  // console.log(user);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }
  
  return NextResponse.json(user);
}