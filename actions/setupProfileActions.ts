"use server";
import prisma from "@/lib/index";
import { uploadFileToAzure } from "./uploadActions";

export const createTalentProfile = async (
  resumeUrl: string,
  userId: string
) => {
  try {

    if (!resumeUrl) {
      return {
        error: "Error uploading resume",
        status: 500,
      };
    }
    if (!userId) {
      return {
        error: "User not found",
        status: 500,
      };
    }
    const profile = await prisma.talentProfile.create({
      data: {
        userId,
        resumeUrl,
      },
    });

    return {
      status: 200,
      data: {
        id: profile.id,
        resumeUrl: profile.resumeUrl,
      },
      message: "Talent profile created successfully",
    };
  } catch (error) {
    console.error("Error creating talent profile:", error);
    return {
      error: "Error uploading resume",
      status: 500,
    };
  }
};

export const getTalentProfile = async (userId: string) => {
  try {
    const res = await prisma.talentProfile.findFirst({
      where: { userId: userId },
    });
    return {
      status: 200,
      data: res,
      message: "Talent Profile data received successfully",
    };
  } catch (error) {
    console.error("Error fetching talent profile:", error);
    return {
      error: "Error uploading resume",
      status: 500,
    };
  }
};

export const createManualProfile = async (userId: string) => {
  try {
    const profile = await prisma.talentProfile.create({
      data: {
        userId,
      },
    });

    return {
      status: 200,
      data: {
        id: profile.id,
      },
      message: "Talent profile created successfully",
    };
  } catch (error) {
    console.error("Error creating talent profile:", error);
    return {
      error: "Error uploading resume",
      status: 500,
    };
  }
};

export const addProfiles = async (
  profiles: string[],
  talentProfileId: string
) => {
  try {
    await prisma.talentProfile.update({
      where: {
        id: talentProfileId,
      },
      data: {
        profiles,
      },
    });

    return {
      message: "Profile added successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error adding profile:", error);
    return {
      error: "Error adding profile",
      status: 500,
    };
  }
};

export const addSkills = async (skills: string[], talentProfileId: string) => {
  try {
    await prisma.talentProfile.update({
      where: {
        id: talentProfileId,
      },
      data: {
        skills,
      },
    });

    return {
      message: "Skills added successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error adding skills:", error);
    return {
      error: "Error adding skills",
      status: 500,
    };
  }
};

export const updateTitle = async (title: string, talentProfileId: string) => {
  try {
    await prisma.talentProfile.update({
      where: {
        id: talentProfileId,
      },
      data: {
        title,
      },
    });

    return {
      message: "Job title updated successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error updating job title:", error);
    return {
      error: "Error updating job title",
      status: 500,
    };
  }
};

type ExperiencesData = {
  company: string;
  position: string;
  location?: string;
  skills: string[];
  startDate: Date;
  endDate?: Date;
  description?: string;
};

export const createExperiences = async (
  experiences: ExperiencesData[],
  talentProfileId: string
) => {
  try {
    // console.log("creating experience")
    const createdExperiences = await Promise.all(
      experiences.map((experience) =>
        prisma.experience.create({
          data: {
            ...experience,
            talentProfileId,
          },
          select: {
            id: true,
            company: true,
            position: true,
            location: true,
            skills: true,
            startDate: true,
            endDate: true,
            description: true,
          },
        })
      )
    );

    return {
      response: createdExperiences,
      message: "experiences added successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error adding experiences:", error);
    return {
      error: "Error adding experiences",
      status: 500,
    };
  }
};

type EducationData = {
  school: string;
  degree: string;
  field?: string;
  grade?: string;
  skills: string[];
  startDate: Date;
  endDate?: Date;
  description?: string;
};

export const createEducation = async (
  educations: EducationData[],
  talentProfileId: string
) => {
  try {
    const res = await Promise.all(
      educations.map((education) =>
        prisma.education.create({
          data: {
            ...education,
            talentProfileId,
          },
          select: {
            id: true,
            school: true,
            degree: true,
            field: true,
            grade: true,
            skills: true,
            startDate: true,
            endDate: true,
            description: true,
          },
        })
      )
    );
    console.log("debug1234:: ", res);
    return {
      response: res,
      message: "Education added successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error adding education:", error);
    return {
      error: "Error adding education",
      status: 500,
    };
  }
};

type LanguageData = {
  language: string;
  proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
};

export const createLanguages = async (
  languages: LanguageData[],
  talentProfileId: string
) => {
  try {
    const res = await Promise.all(
      languages.map((language) =>
        prisma.language.create({
          data: {
            ...language,
            talentProfileId,
          },
          select: {
            id: true,
            language: true,
            proficiency: true,
          },
        })
      )
    );
    return {
      response: res,
      message: "Languages added successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error adding languages:", error);
    return {
      error: "Error adding languages",
      status: 500,
    };
  }
};

export const updateBio = async (bio: string, talentProfileId: string) => {
  try {
    await prisma.talentProfile.update({
      where: {
        id: talentProfileId,
      },
      data: {
        bio,
      },
    });

    return {
      message: "Description updated successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error updating description:", error);
    return {
      error: "Error updating description",
      status: 500,
    };
  }
};

export const updateHourlyRate = async (
  rate: string,
  talentProfileId: string
) => {
  try {
    await prisma.talentProfile.update({
      where: {
        id: talentProfileId,
      },
      data: {
        rate,
      },
    });

    return {
      message: "Hourly rate updated successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error updating hourly rate:", error);
    return {
      error: "Error updating hourly rate",
      status: 500,
    };
  }
};

export const uploadImage = async (formData: FormData, userId: string) => {
  try {
    if (!userId) {
      throw new Error("User not found");
    }
    const image = formData.get("image") as File;

    if (!image) {
      throw new Error("Profile picture not found");
    }

    // console.log("Image:", image.name);

    const fileExtension = image.name.split(".").pop()?.toLowerCase();

    const fileName = `image_${new Date().toISOString()}_${userId}.${fileExtension}`;

    const imageUrl = await uploadFileToAzure(image, fileName);

    if (!imageUrl) {
      return {
        message: "Failed to upload image",
        status: 500,
      };
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        image: imageUrl,
      },
    });

    return {
      message: "Image uploaded successfully",
      status: 200,
      data: {
        imageUrl,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      message: "Failed to upload image",
      status: 500,
    };
  }
};

type UserProfileData = {
  name?: string;
  first_name?: string;
  last_name?: string;
  dateOfBirth?: Date;
  phone?: string;
  street?: string;
  country?: string;
  city?: string;
  state?: string;
  zipCode?: string;
};

export const updateProfile = async (
  userProfileData: UserProfileData,
  userId: string
) => {
  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...userProfileData,
      },
    });

    return {
      message: "Profile updated successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      error: "Error updating profile",
      status: 500,
    };
  }
};
