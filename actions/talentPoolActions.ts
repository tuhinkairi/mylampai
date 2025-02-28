"use server";
import prisma from "@/lib";
import { auth } from "@/lib/authlib";

type UserMatchIdsType = {
  talentPoolId: string;
  talentIds: string[];
};

// get list of candidates for recruiter based on search parameters like skills, salary, location preference,  JD
export const getRecruiterTalentPools = async (recruiterId: string) => {
  try {
    const talentPoolData = await prisma.talentPool.findMany({
      where: {
        userId: recruiterId,
      },
    });

    return {
      success: true,
      data: talentPoolData,
    };
  } catch (error: any) {
    console.error("Error fetching talent pools:", error);

    return {
      success: false,
      error: "Failed to fetch talent pools",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    };
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
        favourites: true,
      },
    });

    return talentPoolData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

//getting candidate profile for detailed analysis after fetching talent pool
export const getCandidateProfile = async (candidateId: string) => {
  try {
    const candidateProfile = await prisma.talentPool.findFirst({
      where: {
        id: candidateId,
      },
    });
    return candidateProfile;
  } catch (error) {
    console.error(error);
    return null;
  }
};

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
      include: {
        user: true,
        education: true,
        projects: true,
        employment: true,
        favouritedBy: true,
        talentMatch: true,
      },
      take: 50,
      orderBy: {
        createdAt: "desc",
      },
    });

    // return matches;
    return { success: true, data: matches };
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
    const res = await prisma.talentPool.create({
      data: { ...talentPool },
    });

    return {
      status: 200,
      data: res,
    };
  } catch (error) {
    console.log(error);
    return "failed";
  }
};

export const sendOfferToTalents = async (userMatchIds: UserMatchIdsType) => {
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
    console.log(error);
    return {
      status: "failed",
      message: "Failed to send invites. Please try again",
    };
  }
};

export const revokeOfferFromTalents = async (
  userMatchIds: UserMatchIdsType
) => {
  try {
    const { talentPoolId, talentIds } = userMatchIds;
    // Delete talent matches from the TalentMatch table
    const deletedMatches = await prisma.talentMatch.deleteMany({
      where: {
        talentPoolId,
        talentId: { in: talentIds },
      },
    });

    console.log("Offers revoked from talents:", deletedMatches);
    return { status: "success", message: "Offers revoked successfully" };
  } catch (error) {
    console.error("Error revoking offers from talents:", error);
    return {
      status: "failed",
      message: "Failed to revoke offers. Please try again",
    };
  }
};

export const getAllTalentMatches = async (talentPoolId: string) => {
  try {
    const allMatches = await prisma.talentMatch.findMany({
      where: {
        talentPoolId: talentPoolId,
      },
      include: {
        talent: {
          include: {
            user: true,
          },
        },
      },
    });
    return { status: "success", data: allMatches };
  } catch (error) {
    console.error("Error fetching talents:", error);
    throw new Error("Could not fetch talents");
  }
};

export const addTalentToFavourites = async (
  talentPoolId: string,
  talentProfileId: string
) => {
  try {
    const newFavourite = await prisma.talentPoolFavourite.create({
      data: {
        talentPoolId,
        talentProfileId,
      },
    });

    // console.log("Talent added to favourites:", newFavourite);
    return { status: "success", message: "Talent added to favourites" };
  } catch (error) {
    console.error("Error adding talent to favourites:", error);
    throw new Error("Could not add talent to favourites");
  }
};

export const removeTalentFromFavourites = async (
  talentPoolId: string,
  talentProfileId: string
) => {
  try {
    const deletedFavourite = await prisma.talentPoolFavourite.deleteMany({
      where: {
        talentPoolId,
        talentProfileId,
      },
    });

    // console.log("Talent removed from favourites:", deletedFavourite);
    return { status: "success", message: "Talent removed from favourites" };
  } catch (error) {
    console.error("Error removing talent from favourites:", error);
    throw new Error("Could not remove talent from favourites");
  }
};

export const getFavouriteTalents = async (talentPoolId: string) => {
  try {
    // Fetch all favourite TalentProfiles in a given TalentPool
    const favouriteTalents = await prisma.talentPoolFavourite.findMany({
      where: { talentPoolId },
      include: { talentProfile: true },
    });

    // console.log("Favourite talents:", favouriteTalents);
    return {
      status: "success",
      data: favouriteTalents.map((fav) => fav.talentProfile),
    };
  } catch (error) {
    console.error("Error fetching favourite talents:", error);
    throw new Error("Could not fetch favourite talents");
  }
};
