"use server";
import prisma from "@/lib";
import { NextRequest, NextResponse } from "next/server";

export const getMockInterviews = async (talentProfileId: string) => {
  try {
    if (!talentProfileId) return [];

    const interviews = await prisma.interview.findMany({
      where: { talentProfileId },
      select: {
        id: true,
      },
    });

    return interviews;
  } catch (error) {
    console.log("Error: ", error);
  }
  return [];
};

export const createMockInterview = async (
  talentProfileId?: string,
  talentPoolProfileId?: string
) => {
  try {
    if (!talentProfileId && !talentPoolProfileId) {
      return {
        status: "failed",
        message: "TalentProfileId or TalentPoolProfileId is required",
      };
    }

    // const user = await prisma.user.findUnique({
    //   where: {
    //     id: talentProfileId,
    //   },
    // });

    // if (!user) {
    //   return {
    //     status: "failed",
    //     message: "User not found",
    //   };
    // }

    // const credits = user.credits;

    // if (!credits || credits < 100) {
    //   return {
    //     status: "failed",
    //     message: "Insufficient Credits",
    //   };
    // }

    if (talentProfileId && talentPoolProfileId) {
      return {
        status: "failed",
        message:
          "Only one of talentProfileId or talentPoolProfileId should be set",
      };
    }

    // If talentPoolProfileId is provided, ensure no duplicate interview exists
    if (talentPoolProfileId) {
      const existingInterview = await prisma.interview.findUnique({
        where: { talentPoolProfileId },
      });

      if (existingInterview) {
        return {
          status: "failed",
          message: "An interview already exists for this TalentPoolProfile",
        };
      }
    }

    // Create interview (ensures only one of the two IDs is set)
    const interview = await prisma.interview.create({
      data: {
        talentProfileId: talentProfileId || null,
        // talentPoolProfileId: talentPoolProfileId || null,
      },
    });

    // await prisma.user.update({
    //   where: {
    //     id: talentProfileId,
    //   },
    //   data: {
    //     credits: credits - 100,
    //   },
    // });

    return {
      status: "success",
      interviewId: interview.id,
    };
  } catch (error) {
    console.log("Error: ", error);
  }
  return {
    status: "failed",
    message: "Internal Server Error",
  };
};

export const handleCVUpload = async ({
  cvText,
  interviewId,
}: {
  cvText: string;
  interviewId: string;
}) => {
  try {
    if (!interviewId || !cvText) {
      return {
        status: "failed",
        message: "CV or User not found",
      };
    }

    const interview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        cvText,
      },
    });

    return {
      status: "success",
      message: "CV Uploaded",
      interviewId: interview.id,
    };
  } catch (error) {
    console.log("Error: ", error);
  }

  return {
    status: "failed",
    message: "Internal Server Error",
  };
};

export const handleJDTextUpload = async ({
  jdText,
  interviewId,
}: {
  jdText: string;
  interviewId: string;
}) => {
  try {
    if (!jdText || !interviewId) {
      return {
        status: "failed",
        message: "JD or InterviewId not found",
      };
    }

    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        jdText,
      },
    });

    return {
      message: "JD Updated",
      status: "success",
    };
  } catch (error) {
    console.log("Error: ", error);
  }

  return {
    status: "failed",
    message: "Internal Server Error",
  };
};

export const updateInterviewStarted = async (interviewId: string) => {
  try {
    console.log("helo1");
    if (!interviewId) {
      return {
        status: "failed",
        message: "Interview Id is required",
      };
    }
    console.log("helo11");

    await prisma.interview.update({
      where: {
        id: interviewId,
      },
      data: {
        isStarted: true,
      },
    });

    console.log("helo111");

    return {
      status: "success",
    };
  } catch (error) {
    console.log("Error: ", error);
  }

  return {
    status: "failed",
    message: "Internal Server Error",
  };
};

export const verifyMockInterview = async ({
  interviewId,
  talentProfileId,
}: {
  interviewId: string;
  talentProfileId: string;
}) => {
  try {
    if (!interviewId || !talentProfileId) {
      return {
        code: 0,
        status: "failed",
        message: "Both interviewId and talentProfileId is required",
      };
    }

    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
        talentProfileId,
      },
    });

    if (!interview) {
      return {
        code: 1,
        status: "failed",
        message: "Interview not found",
      };
    }

    if (interview.isStarted)
      return {
        code: 2,
        status: "failed",
        message: "Interview already started before",
      };
    else {
      return {
        status: "success",
      };
    }
  } catch (error) {
    console.log("Error: ", error);
  }

  return {
    code: 3,
    status: "failed",
    message: "Internal Server Error",
  };
};

type MessageData = {
  interviewId: string;
  type: string;
  sender: "system" | "user" | "interviewer";
  response: string;
  code?: string;
};

export const handleMessageUpload = async (messageData: MessageData) => {
  try {
    await prisma.interviewMessage.create({
      data: messageData,
    });

    return {
      status: "success",
      message: "Message added",
    };
  } catch (error) {
    console.log("Error: ", error);
  }

  return {
    status: "failed",
    message: "Internal Server Error",
  };
};

export const submitFeedback = async ({
  rating,
  feedback,
  interviewId,
}: {
  rating: number;
  feedback: string;
  interviewId: string;
}) => {
  try {
    if (!interviewId) {
      return {
        status: "failed",
        message: "Interview Id is required",
      };
    }

    await prisma.interviewFeedback.create({
      data: {
        rating,
        feedback,
        interviewId,
      },
    });

    return {
      status: "success",
      message: "Feedback submitted",
    };
  } catch (error) {
    console.log("Error: ", error);
  }

  return {
    status: "failed",
    message: "Internal Server Error",
  };
};
export const submitanalysis = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const {
      Introduction = [],
      Project = [],
      Coding = [],
      Technical = [],
      Outro = [],
      interviewId,
    } = body;
    if (!interviewId) {
      return NextResponse.json(
        { error: "Missing required field: interviewId" },
        { status: 400 }
      );
    }
    const response = await prisma.analysis.create({
      data: {
        Introduction,
        Project,
        Coding,
        Technical,
        Outro,
        interviewId,
      },
    });
    return NextResponse.json(
      { success: true, data: response },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in submitAnalysis:", error);
    return NextResponse.json(
      { success: false || "Internal server error" },
      { status: 500 }
    );
  }
};

export const getanalysis = async (interviewId: string) => {
  try {
    if (!interviewId) return [];

    const interviews = await prisma.analysis.findMany({
      where: { interviewId },
    });

    return interviews;
  } catch (error) {
    console.log("Error: ", error);
  }
  return [];
};
