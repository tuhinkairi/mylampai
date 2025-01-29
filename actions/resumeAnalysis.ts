"use server";

import prisma from "@/lib";

export type AnalysisDataType = {
    sectionanalysis: object;
    skillsassessment: object;
    quantification: object;
    repetition: object;
    verbstrength: object;
    verbtense: object;
    overusedphrases: object;
    spellingerrors: string[];
    genericpoints: string[];
    summary: string;
    score: number;
    personal_info: object;
    bullet_point_length?: string[];
    bullet_point_improver?: string[];
    total_bullet_points?: object;
    responsibility?: object;
    resume_length?: string[];
    resume_score?:object
    cvId?: string;
};

export const analysisResume = async (data: AnalysisDataType) => {
    try {
        // Ensure the input is valid and type-check
        if (!data || typeof data !== "object") {
            throw new Error("Data is missing or invalid");
        }
        console.log(data)
        const {
            sectionanalysis,
            skillsassessment,
            quantification,
            repetition,
            verbstrength,
            verbtense,
            overusedphrases,
            spellingerrors,
            genericpoints,
            summary,
            score,
            personal_info,
            bullet_point_length,
            bullet_point_improver,
            total_bullet_points,
            responsibility,
            resume_length,
            resume_score,
            cvId
        } = data;

        // Validate required fields
        // if (
        //     !sectionanalysis ||
        //     !skillsassessment ||
        //     !quantification ||
        //     !repetition ||
        //     !verbstrength ||
        //     !verbtense ||
        //     !overusedphrases ||
        //     !spellingerrors.length ||
        //     !genericpoints.length ||
        //     !summary ||
        //     !cvId ||
        //     !personal_info ||
        //     !bullet_point_length ||
        //     !bullet_point_improver ||
        //     !total_bullet_points ||
        //     !responsibility ||
        //     !resume_length ||
        //     !resume_score ||
        //     typeof score !== "number"
        // ) {
        //     console.log({ error: "Missing required fields", status: 400 })
        //     return { error: "Missing required fields", status: 400 };
        // }
        // console.log(userId)
        // Create ResumeAnalysis and link it with the user
        const response = await prisma.resumeAnalysis.create({
            data: {
                sectionanalysis,
                skillsassessment,
                quantification,
                repetition,
                verbstrength,
                verbtense,
                overusedphrases,
                spellingerrors,
                genericpoints,
                summary,
                score,
                personal_info,
                bullet_point_length,
                bullet_point_improver,
                total_bullet_points,
                responsibility,
                resume_length,
                resume_score,
                cvId
            },
        });
        // Return response or error
        // console.log("this is data",data)
        // console.log("the response it is", response)
        if (!response) {
            return { error: "Failed to create resume analysis", status: 500 };
        }

        console.log("uploaded")
        return { success: true, data: response, status: 200 };
    } catch (error) {
        console.error("Error in analysisResume:", error);
        return { success: false, error: "Internal server error", status: 500 };
    }
};

export const fetchAnalysis = async (id: string) => {
    try {
        // Fetch analysis by id
        const response = await prisma.resumeAnalysis.findFirst({
            where: { cvId: id }
        });
        // Return response or error
        console.log(response)
        if (!response) {
            return { error: "Analysis not found", status: 404 };
        }
        return { success: true, data: response, status: 200 };
    } catch (error) {
        console.error("Error in fetchAnalysis:", error);
        return { success: false, error: "Internal server error", status: 500 };
    }
}
