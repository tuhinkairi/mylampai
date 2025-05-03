import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib";
import jwt from "jsonwebtoken";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) => {
  try {
    // const authHeader = req.headers.get("Authorization");
    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // const token = authHeader.substring(7);

    // let decodedToken: any;
    // try {
    //   decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    // } catch (error) {
    //   console.error("JWT verification error:", error);
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // const {
    //   id: userId,
    //   email: userEmail,
    //   name: userName,
    //   role: userRole,
    // } = decodedToken;

    // const community = await prisma.community.findUnique({
    //   where: { id: params.communityId },
    // });

    // if (!community) {
    //   return NextResponse.json(
    //     { error: "Community not found" },
    //     { status: 404 }
    //   );
    // }

    // if (!community.userIds.includes(userId)) {
    //   return NextResponse.json(
    //     { error: "User has not joined the community" },
    //     { status: 400 }
    //   );
    // }

    // const chatToken = jwt.sign(
    //   {
    //     id: userId,
    //     email: userEmail,
    //     name: userName,
    //     role: userRole,
    //     community: community,
    //   },
    //   process.env.JWT_SECRET as string,
    //   { expiresIn: "24h" }
    // );

    // return NextResponse.json({ chatToken: chatToken }, { status: 200 });
  } catch (error) {
    console.error("Error sending message to community:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
