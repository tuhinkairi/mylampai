"use server";
import prisma from "@/lib/index";
import { auth } from "@/lib/authlib";

export const applyJob = async (jobProfileId: string) => {
  try {
    const user = await auth();

    if (!user) {
      return {
        status: "failed",
        message: "User not found",
      };
    }

    await prisma.jobCandidate.create({
      data: {
        jobProfileId,
        candidateId: user.id,
      },
    });

    return {
      status: "success",
      message: "Applied successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      status: "failed",
      message: "Internal server error",
    };
  }
};

export const getJob = async (jodId: string) => {
  try {
    const job = await prisma.jobProfile.findFirst({
      where: {
        id: jodId,
      },
      include: {
        rounds: true,
      },
    });

    return job;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getJobs = async (page: number) => {
  try {
    const jobs = await prisma.jobProfile.findMany({
      skip: (page - 1) * 20,
      take: 10,
      orderBy: {
        createdAt: "desc",
      }
    });

    return jobs;
  } catch (error) {
    console.error(error);
    return [];
  }
};
