import prisma from "@/lib";
import axios from "axios";

export const postRubricEvaluation = async (job_description: string) => {
    try {
        const endpoint = process.env.NEXT_PUBLIC_RUBRICS_API_ENDPOINT ?? "http://127.0.0.1:5000"

        const response = await axios.post(
            endpoint.concat('/get-rubric-evaluation'),
            { "job_description":job_description }
        );
        // console.log("Rubics fetch Success:", response.data);

        return response.data; // Return the API response
    } catch (error) {
        console.error("Rubics fetch Error:", error);
        throw error; // Throw error so it can be handled where called
    }
};



export const addRubricsToJobRound = async (
  jobRoundId: string,
  rubrics: {
    parameter: string;
    description: string;
    weightage: number;
    type: string;
    condition: string;
  }[]
) => {
  try {
    // Check if the job round exists
    const jobRound = await prisma.jobRound.findUnique({
      where: { id: jobRoundId },
    });

    if (!jobRound) {
      throw new Error("Job Round not found");
    }

    // Create rubrics and associate them with the job round

    // console.log("this is rubrics",rubrics)
    const createdRubrics = await prisma.jobRoundRubric.createMany({
      data: rubrics.map((rubric) => ({
        ...rubric,
        jobRoundId,
      })),
    });

    return {
      status: "success",
      message: "Rubrics added successfully",
      rubrics: createdRubrics,
    };
  } catch (error) {
    console.error("❌ Error adding rubrics:", error);
    throw new Error("Failed to add rubrics");
  }
};
export const getRubricsList = async (RoundId: string) => {
  try {
    const response = await fetch("/api/recruiter/rubrics/updaterubrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ RoundId }),
    });

    if (!response.ok) throw new Error("Failed to fetch rubrics");

    return await response.json();
  } catch (error) {
    console.error("Error fetching job round rubrics:", error);
    return { status: "failed", message: "Internal Server Error", error };
  }
};

// export const getRubricsList = async (RoundId: string) => {
//   try {
//     const rubrics = await prisma.jobRoundRubric.findMany({
//       where: {
//         jobRoundId:RoundId,
//       }
//     });
//     console.log("list of rubrics",rubrics)
//     return { status: "success", data: rubrics };
//   } catch (error) {
//     console.log(error);
//     return { status: "failed", message: "Internal Server Error", error:error };
//   }
// };

// Update Rubric
export const updateRubric = async (rubricData: any) => {
  try {
    const response = await fetch("/api/recruiter/rubrics/updaterubrics", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rubricData),
    });

    if (!response.ok) throw new Error("Failed to update rubric");
    
    return await response.json();
  } catch (error) {
    console.error("Error updating rubric:", error);
    return { status: "failed", message: "Internal Server Error" };
  }
};

// Delete Rubric
export const deleteRubric = async (id: string) => {
  try {
    const response = await fetch("/api/recruiter/rubrics/updaterubrics", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) throw new Error("Failed to delete rubric");

    return await response.json();
  } catch (error) {
    console.error("Error deleting rubric:", error);
    return { status: "failed", message: "Internal Server Error" };
  }
};

// Add a New Rubric
export const addSingleRubric = async (rubricData: any) => {
  try {
    const response = await fetch("/api/recruiter/rubrics/addsinglerubric", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rubricData),
    });

    if (!response.ok) throw new Error("Failed to add rubric");

    return await response.json();
  } catch (error) {
    console.error("Error adding rubric:", error);
    return { status: "failed", message: "Internal Server Error" };
  }
};
