"use server";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  image: string;
}

export async function auth() {
  const cookieStore = await cookies();
  const accessToken = await cookieStore.get("accessToken");

  if (!accessToken || !accessToken.value) return null;

  try {
    const decoded = jwt.verify(
      accessToken?.value as string,
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
