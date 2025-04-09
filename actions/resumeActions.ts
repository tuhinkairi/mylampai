"use server";
import prisma from "@/lib";
import { uploadFileToAzure } from "./uploadActions";

export const getUserResumesList = async (userId: string) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        resumeUrl: true,
        resumeName: true,
        resumeFileText: true,
      },
    });

    return resumes;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// const fileToBase64 = (file: File): Promise<string | null> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       const base64String = reader.result?.toString().split(",")[1] || null;
//       resolve(base64String);
//     };
//     reader.onerror = () => reject(null);
//     reader.readAsDataURL(file);
//   });
// };

// interface ResumeRequestBody {
//   resumeFile: File;
// }

// export const addUsersResume = async (
//   { body }: { body: ResumeRequestBody },
//   userId: string
// ) => {
//   try {
//     const resume = body.resumeFile;

//     if (!resume || !userId) {
//       return { status: "failed", message: "Invalid data" };
//     }

//     const resumeName =
//       "resume_" + new Date().toISOString() + "_" + userId + ".pdf";

//     const resumeUrl = await uploadFileToAzure(resume, resumeName);

//     const resumeBase64 = await fileToBase64(resume);

//     if (!resumeUrl) {
//       return { status: "failed", message: "Invalid data" };
//     }

//     await prisma.resume.create({
//       data: {
//         resumeName: resume.name,
//         resumeUrl,
//         userId,
//         resumeBase64,
//       },
//     });

//     return {
//       status: "success",
//       resumeUrl: resumeUrl,
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       status: "failed",
//       message: "Failed to upload resume",
//     };
//   }
// };
