import { addRubricsToJobRound } from "@/actions/jobs/rubricsGet";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { jobRoundId, rubrics } = await req.json();
    // console.log(jobRoundId, rubrics?.result?.evaluation_criteria)
    const rubricsData = rubrics?.result?.evaluation_criteria
    if (!jobRoundId || !Array.isArray(rubricsData) || rubrics.length === 0) {
      return NextResponse.json(
        { error: "jobRoundId and rubrics array are required" },
        { status: 400 }
      );
    }

    // Call the function to add rubrics
    const result = await addRubricsToJobRound(jobRoundId, rubricsData); //taking jobroundid and list of rubics
    console.log(result)
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Error in API:", error);
    return NextResponse.json(
      { error: "Failed to add rubrics" },
      { status: 500 }
    );
  }
}
