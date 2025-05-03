"use server";
import prisma from "@/lib";

export const getInterviewTemplate = async (templateId: string) => {
  try {
    const template = await prisma.interviewTemplate.findUnique({
      where: {
        id: templateId,
      },
      include: {
        rubrics: true,
      },
    });

    if (!template) {
      return {
        status: 404,
        message: "Template not found",
      };
    }

    return {
      status: 200,
      result: template,
    };
  } catch (error) {
    console.error("Error fetching interview template:", error);
    return {
      status: 500,
      message: "Internal Server Error",
    };
  }
};

export const getInterviewTemplates = async () => {
  try {
    const templates = await prisma.interviewTemplate.findMany({
      include: {
        rubrics: true,
      },
    });

    return {
      status: 200,
      result: templates,
    };
  } catch (error) {
    console.error("Error fetching interview templates:", error);
    return {
      status: 500,
      message: "Internal Server Error",
    };
  }
};
