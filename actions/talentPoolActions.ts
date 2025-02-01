"use server";
import prisma from "@/lib";
import { auth } from "@/lib/authlib";

type UserMatchIdsType = {
  talentPoolId: string;
  talentIds: string[];
};


// get list of candidates for recruiter based on search parameters like skills, salary, location preference,  JD
// TODO: Implement semantic search based on recruiter search prompt
export const getRecruiterTalentPool = async (searchParameter: { skills?: string; salary?: number; locationPref?: string },page:number,limit:number ) => {
  try {
    // const page = parseInt(url.searchParams.get("page") || "1", 10); 
    // const limit = parseInt(url.searchParams.get("limit") || "10", 10); 
    const offset = (page - 1) * limit;
    const { skills, salary, locationPref } = searchParameter;
    const whereClause: any = {};

    //these are filter parameters
    if (skills) whereClause.skills = skills;
    if (salary) whereClause.salary = salary;
    if (locationPref) whereClause.locationPref = locationPref;


    const talentPools = await prisma.talentPool.findMany({
      skip: offset,
      take: limit,
      where: whereClause
    });
    const totalItems = await prisma.talentPool.count({where:whereClause}); // Total number of items

    return new Response(
      JSON.stringify({
        talentPools,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      }),
      { status: 200 }
    );

    // return talentPools;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getTalentPoolData = async (talentPoolId: string) => {
  try {
    const user = await auth();

    if (!user) {
      return null;
    }

    const talentPoolData = await prisma.talentPool.findFirst({
      where: {
        id: talentPoolId,
        userId: user.id,
      },
      select: {
        id: true,
        skills: true,
        profiles: true,
        salary: true,
        locationPref: true,
        talents: true,
      },
    });

    return talentPoolData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

//getting candidate profile for detailed analysis after fetching talent pool
export const getCandidateProfile=async(candidateId:string)=>{
  try {
    const candidateProfile = await prisma.talentPool.findFirst({
      where: {
        id: candidateId
      }
    });
    return candidateProfile;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const getTalentPoolsData = async (targetPoolIds: string[]) => {
  try {
    const talentPoolsData = await prisma.talentPool.findMany({
      where: {
        id: {
          in: targetPoolIds,
        },
      },
    });

    return talentPoolsData;
  } catch (error) {
    console.error(error);
    return [];
  }
};

type TalentPoolDataType = {
  skills: string[];
  profiles: string[];
  salary: string;
  locationPref: string;
};

export const matchTalentProfile = async (
  talentPoolData: TalentPoolDataType
) => {
  try {
    const matches = await prisma.talentProfile.findMany({
      where: {
        OR: [{ skills: { hasSome: talentPoolData.skills } }],
      },
      take: 50,
      orderBy: {
        createdAt: "desc",
      },
    });

    return matches;
  } catch (error) {
    console.error(error);
    return [];
  }
};

type TalentPoolType = {
  userId: string;
  skills: string[];
  profiles: string[];
  salary: string;
  locationPref: string;
};

export const createTalentPool = async (talentPool: TalentPoolType) => {
  try {
    await prisma.talentPool.create({
      data: { ...talentPool },
    });

    return "success";
  } catch (error) {
    console.log(error);
    return "failed";
  }
};

export const addUsersInTalentPool = async (userMatchIds: UserMatchIdsType) => {
  try {
    const { talentPoolId, talentIds } = userMatchIds;

    const talentPool = await prisma.talentPool.findFirst({
      where: {
        id: talentPoolId,
      },
    });

    if (!talentPool) {
      return { status: "failed", message: "Talent pool not found" };
    }

    const talentMatchPromises = talentIds.map((talentId) =>
      prisma.talentMatch.create({
        data: {
          talentId,
          talentPoolId,
        },
      })
    );

    await Promise.all(talentMatchPromises);

    return { status: "success", message: "Invites sent successfully" };
  } catch (error) {
    console.error(error);
    return {
      status: "failed",
      message: "Failed to send invites. Please try again",
    };
  }
};
