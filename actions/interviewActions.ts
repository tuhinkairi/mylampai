"use server";
import prisma from "@/lib";
import { NextRequest, NextResponse } from "next/server";

export const getMockInterviews = async (talentProfileId: string) => {
  try {
    if (!talentProfileId) return [];

    const interviews = await prisma.mockInterview.findMany({
      where: { talentProfileId },
      select: {
        id: true,
        interviewState: true,
        interviewFeedback: true,
        analysis: true,
        messages: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return interviews;
  } catch (error) {
    console.log("Error: ", error);
  }
  return [];
};

export const getInterviews = async (talentPoolProfileId: string) => {
  try {
    if (!talentPoolProfileId) return [];

    const interviews = await prisma.interview.findMany({
      where: { talentPoolProfileId },
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

export const createInterview = async (
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

    let interview;
    // Create interview (ensures only one of the two IDs is set)

    if (talentProfileId) {
      interview = await prisma.mockInterview.create({
        data: {
          talentProfileId: talentProfileId,
        },
      });
    } else if (talentPoolProfileId) {
      // interview = await prisma.interview.create({
      //   data: {
      //     talentPoolProfileId: talentPoolProfileId,
      //   },
      // });
    } else {
      return {
        status: "failed",
        message:
          "Only one of talentProfileId or talentPoolProfileId should be required",
      };
    }

    // await prisma.user.update({
    //   where: {
    //     id: talentProfileId,
    //   },
    //   data: {
    //     credits: credits - 100,
    //   },
    // });

    if (!interview) {
      return {
        status: "failed",
        message: "Interview not created",
      };
    }

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

export const handleInterviewState = async (
  interviewId: string,
  state: string,
  interviewType: string
) => {
  try {
    if (!interviewId) {
      return {
        status: "failed",
        message: "Interview Id is required",
      };
    }

    if (interviewType === "talent") {
      await prisma.interview.update({
        where: { id: interviewId },
        data: {
          interviewState: state,
        },
      });
    } else {
      await prisma.mockInterview.update({
        where: { id: interviewId },
        data: {
          interviewState: state,
        },
      });
    }
    return {
      status: "success",
      message: "Interview State Updated",
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
  resumeText,
  interviewId,
}: {
  resumeText: string;
  interviewId: string;
}) => {
  try {
    if (!interviewId || !resumeText) {
      return {
        status: "failed",
        message: "CV or User not found",
      };
    }

    const interview = await prisma.mockInterview.update({
      where: { id: interviewId },
      data: {
        resumeText,
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

    await prisma.mockInterview.update({
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

// export const updateInterviewStarted = async (interviewId: string) => {
//   try {
//     console.log("helo1");
//     if (!interviewId) {
//       return {
//         status: "failed",
//         message: "Interview Id is required",
//       };
//     }
//     console.log("helo11");

//     await prisma.mockInterview.update({
//       where: {
//         id: interviewId,
//       },
//       data: {
//         isStarted: true,
//       },
//     });

//     console.log("helo111");

//     return {
//       status: "success",
//     };
//   } catch (error) {
//     console.log("Error: ", error);
//   }

//   return {
//     status: "failed",
//     message: "Internal Server Error",
//   };
// };

export const verifyInterview = async ({
  interviewId,
  talentProfileId,
  talentPoolProfileId,
  interviewType,
}: {
  interviewId: string;
  talentProfileId?: string;
  talentPoolProfileId?: string;
  interviewType: string;
}) => {
  try {
    if (!interviewId || !talentProfileId) {
      return {
        code: 0,
        status: "failed",
        message: "Both interviewId and talentProfileId is required",
      };
    }

    let interview;

    if (interviewType === "talent") {
      interview = await prisma.interview.findUnique({
        where: {
          id: interviewId,
          talentPoolProfileId,
        },
      });
    } else {
      interview = await prisma.mockInterview.findUnique({
        where: {
          id: interviewId,
          talentProfileId,
        },
      });
    }

    if (!interview) {
      return {
        code: 1,
        status: "failed",
        message: "Interview not found",
      };
    } else {
      return {
        status: "success",
        data: interview,
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
    if (!messageData.interviewId) {
      return {
        status: "failed",
        message: "Interview Id is required",
      };
    }

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
    const response = await prisma.interviewAnalysis.create({
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

    const interviews = await prisma.interviewAnalysis.findMany({
      where: { interviewId },
    });

    return interviews;
  } catch (error) {
    console.log("Error: ", error);
  }
  return [];
};

export const getInterviewVideo = async (
  interviewId: string,
  interviewType: string
) => {
  try {
    if (!interviewId)
      return {
        status: "failed",
        message: "Interview Id is required",
      };

    if (!interviewType)
      return {
        status: "failed",
        message: "Interview Type is required",
      };

    let interview;
    if (interviewType === "talent") {
      interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        select: {
          videoUrl: true,
          createdAt: true,
        },
      });
    } else {
      interview = await prisma.mockInterview.findUnique({
        where: { id: interviewId },
        select: {
          videoUrl: true,
          createdAt: true,
        },
      });
    }
    if (!interview) {
      return {
        status: "failed",
        message: "Interview not found",
      };
    }
    return {
      status: 200,
      data: interview,
      message: "Interview found",
    };
  } catch (error) {
    console.log("Error: ", error);
  }
  return [];
};

export const updateInterviewVideo = async (
  interviewId: string,
  videoUrl: string,
  interviewType: string
) => {
  try {
    if (!interviewId) return [];

    if (!interviewType) return [];

    if (interviewType === "talent") {
      await prisma.interview.update({
        where: { id: interviewId },
        data: {
          videoUrl,
        },
      });
    } else {
      await prisma.mockInterview.update({
        where: { id: interviewId },
        data: {
          videoUrl,
        },
      });
    }

    return {
      status: 200,
      message: "Interview video updated",
    };
  } catch (error) {
    console.log("Error: ", error);
  }
};

export const getConversation = async (interviewId: string) => {
  try {
    if (!interviewId) return [];

    const interviews = await prisma.interviewMessage.findMany({
      where: { interviewId },
      select: {
        id: true,
        type: true,
        sender: true,
        response: true,
        createdAt: true,
      },
    });

    return {
      status: 200,
      data: interviews,
      message: "Conversation found",
    };
  } catch (error) {
    console.log("Error: ", error);
  }
  return [];
};
