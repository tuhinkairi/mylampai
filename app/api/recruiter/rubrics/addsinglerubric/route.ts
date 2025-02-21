import prisma from "@/lib";
import { NextResponse } from "next/server";

// ✅ Create Rubric
export async function POST(req: Request) {
  try {
    const { parameter, description, weightage, type, condition, jobRoundId } = await req.json();

    if (!jobRoundId) return NextResponse.json({ status: "failed", message: "Missing Job Round ID" }, { status: 400 });

    const newRubric = await prisma.jobRoundRubric.create({
      data: { parameter, description, weightage, type, condition, jobRoundId },
    });

    return NextResponse.json({ status: "success", data: newRubric });
  } catch (error) {
    console.error("Error creating rubric:", error);
    return NextResponse.json({ status: "failed", message: "Internal Server Error" }, { status: 500 });
  }
}
