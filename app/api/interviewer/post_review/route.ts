import { submitanalysis } from "@/actions/interviewActions";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const result = await submitanalysis(req); // Call your action function

    // Ensure the response from `submitanalysis` is properly structured.
    if (!result) {
      return NextResponse.json( 
        { message: "No result from action function" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Success", data: result }, { status: 200 });
  } catch (error: any) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
};
