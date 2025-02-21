"use server";
import prisma from "@/lib";

export interface JobInput {
    title: string;
    internalNote?: string;
    requiredSkills: string[];
    employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
    workNature: "ONSITE" | "REMOTE" | "HYBRID";
    salary?: number;
    benefits?: string;
    jobCategory?: string;
    subDomain?: string;
    eligibility?: string;
    openings?: number;
    recruiterId: string;
    rubrics?: {
        weightage: number;
        type: "LIMIT" | "CONSTRAINT" | "NORMAL";
        condition?: string;
    }[];
}

export async function createJobFromJson(jobData: JobInput) {
    try {
        const recruiter = await prisma.recruiter.findUnique({
            where: { id: jobData.recruiterId }
        });

        if (!recruiter) {
            throw new Error("Recruiter not found. Make sure the recruiter exists before creating a job.");
        }
        const newJob = await prisma.job.create({
            data: {
                title: jobData.title,
                internalNote: jobData.internalNote,
                requiredSkills: jobData.requiredSkills,
                employmentType: jobData.employmentType,
                workNature: jobData.workNature,
                salary: jobData.salary,
                benefits: jobData.benefits,
                jobCategory: jobData.jobCategory,
                subDomain: jobData.subDomain,
                eligibility: jobData.eligibility,
                openings: jobData.openings,
                recruiter: {
                    connect: { id: jobData.recruiterId },
                },
                rubrics: jobData.rubrics
                    ? {
                        create: jobData.rubrics.map((rubric) => ({
                            weightage: rubric.weightage,
                            type: rubric.type,
                            condition: rubric.condition,
                        })),
                    }
                    : undefined,
            },
        });

        console.log("Job created successfully:", newJob);
        return newJob;
    } catch (error) {
        console.error("Error creating job:", error);
        throw new Error("Job creation failed");
    }
}
