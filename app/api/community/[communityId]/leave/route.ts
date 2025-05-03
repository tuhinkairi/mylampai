import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib"; // Adjust the path as per your project structure
import jwt from "jsonwebtoken";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) => {
  try {
    // Extract authorization token from request headers
    // const authHeader = req.headers.get("Authorization");
    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // // Verify and decode the JWT token
    // let decodedToken: any;
    // try {
    //   decodedToken = jwt.verify(
    //     token,
    //     process.env.JWT_SECRET as string
    //   );
    // } catch (error) {
    //   console.error("JWT verification error:", error);
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // // Extract user ID from decoded token
    // const { id: userId } = decodedToken;

    // // Validate community ID
    // const { communityId } = params;
    // if (!communityId) {
    //   return NextResponse.json(
    //     { error: "Community ID is required" },
    //     { status: 422 }
    //   );
    // }

    // // Check if the community exists
    // const community = await prisma.community.findUnique({
    //   where: { id: communityId },
    // });

    // if (!community) {
    //   return NextResponse.json(
    //     { error: "Community not found" },
    //     { status: 404 }
    //   );
    // }

    // // Remove user from the community
    // const updatedCommunity = await prisma.community.update({
    //   where: { id: communityId },
    //   data: {
    //     userIds: {
    //       set: community.userIds.filter((id) => id !== userId), // Remove user from userIds array
    //     },
    //   },
    // });

    // return NextResponse.json({ community: updatedCommunity }, { status: 200 });
  } catch (error) {
    console.error("Error leaving community:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
