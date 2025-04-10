//All actions belongs to  /talentmatch router should be in this file

"use server";
import prisma from "@/lib";
import { generateSasToken } from "./azureActions";
import { auth } from "@/lib/authlib";

type TalentPoolProfileType = {
  resumeId: string;
  role: string;
  skills: string[];
  availability: string;
  targetFor: string;
  interviewDate: Date;
  talentProfileId: string;
};

export const createTalentPoolProfile = async (
  talentPoolProfileData: TalentPoolProfileType
) => {
  try {
    const res = await prisma.talentPoolProfile.create({
      data: {
        ...talentPoolProfileData,
      },
      include: {
        resume: true,
      },
    });

    const interview = await prisma.interview.create({
      data: {
        talentPoolProfileId: res.id,
        interviewDate: talentPoolProfileData.interviewDate,
        interviewState: "Scheduled",
      },
    });

    return {
      message: "Profile created successfully",
      status: "success",
      data: { ...res, interviewId: interview.id },
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Internal Server Error",
      status: "failed",
    };
  }
};

export const getTalentMatches = async (userId: string) => {
  try {
    const talentMatches = await prisma.talentMatch.findMany({
      where: {
        talentId: userId,
      },
      select: {
        talentPool: true,
        id: true,
        isMatched: true,
        isHired: true,
      },
    });
    return talentMatches;
  } catch (error) {
    console.error(error);
    return "failed";
  }
};

export const acceptTalentMatch = async (matchId: string) => {
  try {
    await prisma.talentMatch.update({
      where: {
        id: matchId,
      },
      data: {
        isMatched: true,
      },
    });

    return "success";
  } catch (error) {
    console.error(error);
    return "failed";
  }
};

type StructuredData = {
  title: string;
  description: string;
  skills: string[];
  rate: string;
};

type ProfileData = {
  resumeId: string;
  interviewId: string;
  skills: string[];
  profiles: string[];
  certifications: string[];
  expectedSalary: string;
  locationPref: "Onsite" | "Remote" | "Hybrid";
  availability: "FULL_TIME" | "PART_TIME" | "FREELANCE";
  experienceYears: string;
  userName: string;
};

export const updateTalentProfile = async (
  profileData: ProfileData,
  profileId: string
) => {
  try {
    const user = await auth();

    if (!user) {
      return "failed";
    }

    await prisma.talentProfile.update({
      where: {
        id: profileId,
      },
      data: profileData,
    });

    return "success";
  } catch (error) {
    console.error(error);
    return "failed";
  }
};

export const getTalentPoolProfiles = async (talentProfileId: string) => {
  try {
    const talentProfile = await prisma.talentPoolProfile.findMany({
      where: {
        talentProfileId,
      },
      select: {
        id: true,
        resumeId: true,
        role: true,
        targetFor: true,
        skills: true,
        availability: true,
        locationPref: true,
        interviewDate: true,
        interviewState: true,
        resume: true,
        interview: true,
      },
    });

    return {
      status: 200,
      data: talentProfile,
    };
  } catch (error) {
    console.error(error);
    null;
  }
};

// export const getResumeAndInterviewIds = async (userId: string) => {
//   try {
//     const resumeIds = await prisma.resume.findMany({
//       where: {
//         userId,
//       },
//       select: {
//         id: true,
//       },
//     });

//     const interviewIds = await prisma.mockInterview.findMany({
//       where: {
//         userId,
//       },
//       select: {
//         id: true,
//       },
//     });

//     return {
//       status: "success",
//       resumeIds,
//       interviewIds,
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       status: "failed",
//       resumeIds: [],
//       interviewIds: [],
//     };
//   }
// };

// export const uploadResumeToAzure = async (formData: FormData) => {
//   try {
//     const user = await auth();

//     if (!user) {
//       return {
//         status: "failed",
//         message: "User not authenticated",
//       };
//     }

//     const date = new Date().toISOString();
//     const fileName = `cv-${date}-${user.id}.pdf`;

//     const sasUrl = await generateSasToken(fileName);

//     if (!sasUrl) {
//       return {
//         status: "failed",
//         message: "Failed to upload Resume",
//       };
//     }

//     const file = formData.get("file") as File;
//     const response = await fetch(sasUrl, {
//       method: "PUT",
//       headers: {
//         "x-ms-blob-type": "BlockBlob",
//       },
//       body: file,
//     });

//     if (!response.ok) {
//       return {
//         status: "failed",
//         message: "Failed to upload CV",
//       };
//     }

//     const resumeUrl = sasUrl.split("?")[0];

//     await prisma.resume.create({
//       data: {
//         userId: user.id,
//         resumeUrl,
//         resumeName: file.name,
//       },
//     });

//     return {
//       status: "success",
//       message: "CV uploaded successfully",
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       status: "failed",
//       message: "Error uploading CV",
//     };
//   }
// };

//Functions to handle Bio
export const updateTalentBio = async (talentProfileId: string, bio: string) => {
  try {
    await prisma.talentProfile.update({
      where: {
        id: talentProfileId,
      },
      data: {
        bio,
      },
    });

    return "success";
  } catch (error) {
    console.error(error);
    return "failed";
  }
};

// Functions to handle Education
type EducationData = {
  school: string;
  degree?: string;
  field?: string;
  grade?: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  skills: string[];
};
export const getProfileEducations = async (talentProfileId: string) => {
  try {
    const educations = await prisma.education.findMany({
      where: {
        talentProfileId,
      },
    });

    return educations;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createTalentEducation = async (
  educationData: EducationData,
  talentProfileId: string
) => {
  try {
    const res = await prisma.education.create({
      data: { ...educationData, talentProfileId },
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
    });

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

export const updateTalentEducation = async (
  educationData: EducationData,
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
    console.error(error);
    return "failed";
  }
};

export const deleteTalentEducation = async (id: string) => {
  try {
    await prisma.education.delete({
      where: {
        id: id,
      },
    });
    return {
      message: "Education deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.error(error);
    return "failed";
  }
};

//Functions to handle Experiences

type ExperiencesData = {
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  skills: string[];
};
export const getProfileExperiences = async (talentProfileId: string) => {
  try {
    const experiences = await prisma.experience.findMany({
      where: {
        talentProfileId,
      },
    });

    return experiences;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createTalentExperience = async (
  experienceData: ExperiencesData,
  talentProfileId: string
) => {
  try {
    const res = await prisma.experience.create({
      data: { ...experienceData, talentProfileId },
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
    });

    return {
      response: res,
      message: "Experience added successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error adding experience:", error);
    return {
      error: "Error adding experience",
      status: 500,
    };
  }
};

export const updateTalentExperience = async (
  experienceData: ExperiencesData,
  id: string
) => {
  try {
    await prisma.experience.update({
      where: {
        id,
      },
      data: experienceData,
    });

    return "success";
  } catch (error) {
    console.error(error);
    return "failed";
  }
};

export const deleteTalentExperience = async (id: string) => {
  try {
    await prisma.experience.delete({
      where: {
        id: id,
      },
    });
    return {
      message: "Experience deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.error(error);
    return "failed";
  }
};

// Functions to handle Projects
type ProjectDataType = {
  title: string;
  description: string;
  role?: string;
  url?: string;
  startDate?: Date;
  endDate?: Date;
  skills: string[];
};
export const getProfileProjects = async (talentProfileId: string) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        talentProfileId,
      },
    });

    return projects;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createTalentProject = async (
  projectData: ProjectDataType,
  talentProfileId: string
) => {
  try {
    const res = await prisma.project.create({
      data: { ...projectData, talentProfileId },
      select: {
        id: true,
        title: true,
        description: true,
        role: true,
        url: true,
        startDate: true,
        endDate: true,
        skills: true,
      },
    });

    return {
      response: res,
      message: "Project added successfully",
      status: 200,
    };
  } catch (error) {
    console.error(error);
    return "failed";
  }
};

export const updateTalentProject = async (
  projectData: ProjectDataType,
  id: string
) => {
  try {
    await prisma.project.update({
      where: {
        id,
      },
      data: projectData,
    });

    return "success";
  } catch (error) {
    console.error(error);
    return "failed";
  }
};

export const deleteTalentProject = async (id: string) => {
  try {
    await prisma.project.delete({
      where: {
        id: id,
      },
    });
    return {
      message: "Project deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.error(error);
    return "failed";
  }
};
