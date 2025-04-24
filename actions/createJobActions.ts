"use server";
import prisma from "@/lib/index";

type JobDataType = {
  jobTitle: string;
  jobRole: string;
  jobDescription: string;
  company: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  skills: string[];
  profiles: string[];
  location: string;
  salary: string;
  availability: "FULL_TIME" | "PART_TIME" | "INTERN" | "CONTRACT";
};

export const createJob = async (jobData: JobDataType, userId: string) => {
  try {
    const jobdata = await prisma.jobProfile.create({
      data: {
        ...jobData,
        userId,
      },
    });
    // console.log("job id", jobData)
    return { status: "success", data: jobdata };
  } catch (error) {
    console.error(error);
    return "failed";
  }
};
export const fetchJob = async () => {
  try {
    const jobdata = await prisma.jobProfile.findMany();
    return { status: "success", data: jobdata };
  } catch (error) {
    console.error("Error fetching job data:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export type RoundsType = {
  roundName: string;
  roundNumber: number;
  details: string;
  roundType: string;
  roundDate: Date;
  jobProfileId: string;
  id?: string;
}[];

export const addRounds = async (rounds: RoundsType) => {
  try {
    const createdRounds = await Promise.all(
      rounds.map(async (round) => {
        return await prisma.jobRound.create({
          data: round,
        });
      })
    );
    // console.log(createdRounds)
    return { status: "success", data: createdRounds };
  } catch (error: any) {
    console.error("❌ Error adding rounds:", error);
    return { status: "failed", error: error.message };
  }
};
type CandidateType = {
  jobCandidateId: string;
  jobRoundId: string;
};

export const shortCandidates = async (candidates: CandidateType[]) => {
  try {
    await prisma.qualifiedRounds.createMany({
      data: candidates,
    });
    return "success";
  } catch (error) {
    console.error(error);
    return "failed";
  }
};

export const updateJobStatus = async (
  candidatesId: string[],
  status: "REJECTED" | "SELECTED"
) => {
  try {
    await prisma.jobCandidate.updateMany({
      where: {
        id: {
          in: candidatesId,
        },
      },
      data: {
        status,
      },
    });

    return "success";
  } catch (error) {
    console.error(error);
    return "failed";
  }
};

export const getRecruiterJobs = async (userId: string) => {
  try {
    const jobs = await prisma.jobProfile.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        jobTitle: true,
        jobRole: true,
        company: true,
        startDate: true,
        skills: true,
        salary: true,
        location: true,
        availability: true,
      },
    });

    return jobs;
  } catch (error) {
    console.log(error);
    return [];
  }
};
