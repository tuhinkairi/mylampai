"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LoadingGlobal from "@/components/ui/loading";
// import { getJobRoundRubrics } from "@/actions/createJobActions";

interface JobRoundRubric {
  id: string;
  parameter: string;
  description: string;
  weightage: number;
  type: string;
  condition: string;
  jobRoundId: string;
}

export default function RubricList({ rubrics }: { rubrics: JobRoundRubric[] }) {

  // const [rubrics, setRubrics] = useState<JobRoundRubric[]>([]);
  const [loading, setLoading] = useState(false);
  console.log(rubrics)
  // useEffect(() => {
  //   if (!jobRoundId) return;
  //   // get rubrics function to fetch data of rubrics from /api/recruiter/rubrics/showrubrics endpoint
  //   const getJobRoundRubrics = async (jobRoundId: string, endpoint: string) => {
  //     try {
  //       const response = await fetch(endpoint, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ jobRoundId }),
  //       });

  //       if (!response.ok) throw new Error("Failed to fetch rubrics");

  //       return await response.json();
  //     } catch (error) {
  //       console.error("Error fetching job round rubrics:", error);
  //       return [];
  //     }
  //   };

  //   getJobRoundRubrics(jobRoundId, "api/recruiter/rubrics/showrubrics")
  //     .then((data) => {
  //       setRubrics(data);
  //       setLoading(false);
  //     })
  //     .catch(() => setLoading(false));
  // }, [jobRoundId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Job Round Rubrics</h2>

      {loading ? (
        <LoadingGlobal text={"Rubrics"}/>
      ) : rubrics.length === 0 ? (
        <p>No rubrics found.</p>
      ) : (
        <ul className="space-y-4">
          {rubrics.map((rubric) => (
            <li key={rubric.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
              <h3 className="text-lg font-semibold">{rubric.parameter}</h3>
              <p className="text-sm text-gray-600">Type: {rubric.type}</p>
              <p className="text-sm text-gray-600">Weightage: {rubric.weightage}%</p>
              <p className="mt-2">{rubric.description}</p>
              <p className="text-sm text-gray-500">Condition: {rubric.condition}</p>
              <div>
                <button className="border rounded-md p-2 px-5 mt-4 bg-purple-400 hover:bg-purple-500 text-white">Edit</button>
                <button className="border rounded-md p-2 bg-red-400 hover:bg-red-500 ml-2 text-white">delete</button></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


