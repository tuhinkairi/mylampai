import { getanalysis } from "@/actions/interviewActions";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const interviewId = req.nextUrl.pathname.split("/").pop();
console.log("logs in get_review/id api:: ",interviewId);
    if (!interviewId) {
      return NextResponse.json(
        { message: "Missing interviewId in URL path" },
        { status: 400 }
      );
    }
    const result = await getanalysis(interviewId);
    if (!result) {
      return NextResponse.json(
        { message: "No result from action function" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Success", data: result },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
};
