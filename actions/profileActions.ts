"use server";
import prisma from "@/lib";

export const getUserEducations = async (talentProfileId: string) => {
  try {
    if (!talentProfileId) return [];
    const educations = await prisma.education.findMany({
      where: {
        talentProfileId,
      },
    });

    return educations;
  } catch (error) {
    console.error("Error getting educations:", error);
    return [];
  }
};

type EducationType = {
  school: string;
  degree?: string;
  field?: string;
  grade?: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  skills: string[];
};

export const updateUserEducation = async (
  educationData: EducationType,
  id: string
) => {
  try {
    await prisma.education.update({
      where: {
        id,
      },
      data: educationData,
    });

    return "success";
  } catch (error) {
    console.error("Error updating education:", error);
    return "failed";
  }
};
