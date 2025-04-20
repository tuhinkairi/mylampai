"use server";

import prisma from "@/lib";

type AnalysisSection =
  | "sectionanalysis"
  | "skillsassessment"
  | "quantification"
  | "repetition"
  | "verbstrength"
  | "verbtense"
  | "spellingerrors"
  | "summary"
  | "personal_info"
  | "bullet_point_length"
  | "bullet_point_improver"
  | "total_bullet_points"
  | "responsibility"
  | "resume_length"
  | "resume_score"
  | "score";

interface UpdateAnalysisParams {
  resumeId: string;
  section?: AnalysisSection;
  data?: any;
  jobDescription?: string;
}

interface FetchAnalysisParams {
  resumeId: string;
  section?: AnalysisSection | AnalysisSection[]; // Optional - if not provided, fetch all sections
}

export const updateResumeAnalysis = async ({
  resumeId,
  section,
  data,
}: UpdateAnalysisParams) => {
  try {
    // Input validation
    if (!resumeId || !section || data === undefined) {
      return {
        success: false,
        error: "Missing required parameters",
        status: 400,
      };
    }

    // Check if an analysis record exists for this CV
    let analysis = await prisma.resumeAnalysis.findFirst({
      where: { resumeId },
    });

    if (analysis) {
      // Update existing analysis with new section data
      analysis = await prisma.resumeAnalysis.update({
        where: { id: analysis.id },
        data: {
          [section]: data,
          updatedAt: new Date(),
        },
      });
    } else {
      return {
        success: false,
        error: "Internal server error! Already found",
        status: 500,
      };
    }
    return {
      success: true,
      data: analysis,
      status: 200,
    };
  } catch (error) {
    console.error(`Error updating ${section} analysis:`, error);
    return {
      success: false,
      error: "Internal server error",
      status: 500,
    };
  }
};

export const createReusmeAnalysis = async ({
  resumeId,
  jobDescription,
}: {
  resumeId: string;
  jobDescription: string;
}) => {
  try {
    let analysis = await prisma.resumeAnalysis.findFirst({
      where: { resumeId },
    });

    if (!analysis) {
      const result = await prisma.$transaction(async (tx) => {
        const newAnalysis = await tx.resumeAnalysis.create({
          data: {
            resumeId,
            jobDescription,
          },
        });

        const updatedResume = await tx.resume.update({
          where: { id: resumeId },
          data: { isAnalysisDone: true },
        });

        return { newAnalysis, updatedResume };
      });

      return {
        status: 200,
        data: result.newAnalysis,
        message: "Analysis created successfully",
      };
    } else {
      return {
        status: 209,
        message: "One Analysis Already exist! Redirecting..",
      };
    }
  } catch (error) {
    console.error("Error in createResumeAnalysis:", error);
    return {
      success: false,
      error: "Internal server error",
      status: 500,
    };
  }
};

export const fetchResumeAnalysis = async ({
  resumeId,
  section,
}: FetchAnalysisParams) => {
  try {
    if (!resumeId) {
      return {
        success: false,
        error: "CV ID is required",
        status: 400,
      };
    }

    // Define select object for Prisma query
    let selectFields: Record<string, boolean | object> = {
      id: true,
      resumeId: true,
      createdAt: true,
      updatedAt: true,
    };

    // If specific section(s) requested, only select those
    if (section) {
      if (Array.isArray(section)) {
        section.forEach((field) => {
          selectFields[field] = true;
        });
      } else {
        selectFields[section] = true;
      }
    } else {
      // If no section specified, select all fields
      selectFields = {
        id: true,
        resumeId: true,
        jobDescription: true,
        sectionanalysis: true,
        skillsassessment: true,
        quantification: true,
        repetition: true,
        verbstrength: true,
        verbtense: true,
        spellingerrors: true,
        summary: true,
        score: true,
        personal_info: true,
        bullet_point_length: true,
        bullet_point_improver: true,
        total_bullet_points: true,
        responsibility: true,
        resume_length: true,
        resume_score: true,
        createdAt: true,
        updatedAt: true,
        resume: {
          select: {
            resumeUrl: true,
            resumeFileText: true,
          },
        },
      };
    }

    const analysis = await prisma.resumeAnalysis.findFirst({
      where: { resumeId },
      select: selectFields,
    });

    if (!analysis) {
      return {
        success: false,
        error: "Analysis not found",
        status: 404,
      };
    }

    return {
      success: true,
      data: analysis,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching resume analysis:", error);
    return {
      success: false,
      error: "Internal server error",
      status: 500,
    };
  }
};

export const fetchAnalysis = async (id: string) => {
  try {
    // Fetch analysis by id
    const response = await prisma.resumeAnalysis.findFirst({
      where: { resumeId: id },
    });
    // Return response or error
    // console.log(response)
    if (!response) {
      return { error: "Analysis not found", status: 404 };
    }
    return { success: true, data: response, status: 200 };
  } catch (error) {
    console.error("Error in fetchAnalysis:", error);
    return { success: false, error: "Internal server error", status: 500 };
  }
};
