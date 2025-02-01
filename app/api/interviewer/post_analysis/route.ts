import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib"; 

export const POST = async (req: NextRequest) => {
  try {
    const { cvId, analysisData } = await req.json();

    if (!cvId || !analysisData) {
      return NextResponse.json(
        { error: "CV ID and analysis data are required" },
        { status: 400 }
      );
    }
    const existingCV = await prisma.cV.findUnique({
      where: { id: cvId },
    });

    if (!existingCV) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    const existingAnalysis = await prisma.cVAnalysis.findUnique({
      where: { cvId },
    });

    if (existingAnalysis) {
      return NextResponse.json(
        { error: "Analysis already exists for this CV" },
        { status: 409 }
      );
    }

    const newAnalysis = await prisma.cVAnalysis.create({
      data: {
        cvId,
        summary: analysisData.summary,
        resumeScore: analysisData.resumeScore,
        hardSkillsScore: analysisData.hardSkillsScore,
        softSkillsScore: analysisData.softSkillsScore,
        experienceScore: analysisData.experienceScore,
        educationScore: analysisData.educationScore,
        quantificationIssues: analysisData.quantificationIssues,
        bulletPointLength: analysisData.bulletPointLength,
        bulletPointImprovements: analysisData.bulletPointImprovements,
        verbTenseIssues: analysisData.verbTenseIssues,
        weakVerbUsage: analysisData.weakVerbUsage,
        repetitionIssues: analysisData.repetitionIssues,
        sectionFeedback: analysisData.sectionFeedback,
        skillAnalysis: analysisData.skillAnalysis,
        spellingIssues: analysisData.spellingIssues,
        responsibilityIssues: analysisData.responsibilityIssues,
      },
    });

    return NextResponse.json(
      { message: "Analysis uploaded successfully", analysis: newAnalysis },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading analysis:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
