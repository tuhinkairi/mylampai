import { NextRequest, NextResponse } from "next/server";
import { postRubricEvaluation } from "@/actions/jobs/rubricsGet";

export async function POST(req: NextRequest) {
  try {
    const { job_description } = await req.json();

    if (!job_description) {
      return NextResponse.json(
        { error: "Job description is required." },
        { status: 400 }
      );
    }

    // Await the rubric evaluation response
    const generatedRubrics = await postRubricEvaluation(job_description);

    return NextResponse.json({
      status_code: 200,
      result: generatedRubrics,
    });
  } catch (error) {
    console.error("Error generating rubric evaluation:", error);
    return NextResponse.json(
      { error: "Failed to generate rubrics." },
      { status: 500 }
    );
  }
}
