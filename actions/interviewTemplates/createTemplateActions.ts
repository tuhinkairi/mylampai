"use server";
import prisma from "@/lib";
import axios from "axios";

// import { InterviewTemplate } from "@prisma/client";

const endpoint =
  "https://ai-interview-dzawedctafcceya3.centralindia-01.azurewebsites.net";

export const generateInterviewRubrics = async (jobDescriotion: string) => {
  try {
    // console.log("this is job description", jobDescriotion);
    const response = await axios.post(`${endpoint}/generate_rubrics`, {
      job_description: jobDescriotion,
    });
    // console.log("Rubics fetch Success:", response);
    return {
      status: 200,
      result: response.data.rubrics,
    }; // Return the API response
  } catch (error) {
    console.error("Error generating rubrics:", error);
    throw error; // Throw error so it can be handled where called
  }
};

export const createInterviewTemplate = async (
  templateData: {
    title: string;
    jobDescription: string;
    companyName: string;
    roleTitle: string;
    category: string;
    difficulty: string;
    expectedDuration: number;
    isActive: boolean;
  },
  rubrics: {
    parameter: string;
    description: string;
    weightage: number;
  }[]
) => {
  try {
    // Create interview template and associate it with the job round
    const createdTemplate = await prisma.interviewTemplate.create({
      data: {
        ...templateData,
        rubrics: {
          createMany: {
            data: rubrics.map((rubric) => ({
              ...rubric,
            })),
          },
        },
      },
    });

    return {
      status: 200,
      message: "Interview template created successfully",
      templateId: createdTemplate.id,
      rubrics,
    };
  } catch (error) {
    console.error("❌ Error creating interview template:", error);
    throw new Error("Failed to create interview template");
  }
};
