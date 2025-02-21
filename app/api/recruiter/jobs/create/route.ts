import { createJobFromJson, JobInput } from "@/actions/jobs/uploadJob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const jobData:JobInput = await req.json();
    
    // populate the DB
    const newJob = await createJobFromJson(jobData);

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
