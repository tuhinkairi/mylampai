"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getJob } from "@/actions/careerActions"; // Replace with your actual API function
import RubricList from "./RubricsList";
import { getRubricsList } from "@/actions/jobs/rubricsGet";
import LoadingGlobal from "@/components/ui/loading";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { CalendarDays, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/hooks";

export interface Round {
    id: string;
    roundName: string;
    roundNumber: number;
    details: string;
    roundType: string;
    roundDate: string;
    jobProfileId: string;
    createdAt: string;
    updatedAt: string;
}
interface JobRoundRubric {
    id: string;
    parameter: string;
    description: string;
    weightage: number;
    type: string;
    condition: string;
    jobRoundId: string;
}
export const RoundShow = () => {
    let { jobProfileId } = useParams<{ jobProfileId: string }>();
    const jobID = useAppSelector((state)=>state.job.id)
    const [rounds, setRounds] = useState<Round[] | any>([]);
    const [title, setTitle] = useState<string>("")
    const [loading, setLoading] = useState(true);
    const router = useRouter()
    const [rubricsShow, setRubricsShow] = useState<boolean>(false);
    const [rubricsId, setRubricsId] = useState<string>();
    const [rubricsData, setRubricsData] = useState<JobRoundRubric[]>();

    useEffect(() => {
        // if (!jobProfileId) return;

        getJob(jobProfileId || jobID)
            .then((res) => {
                if (res?.rounds) {

                    setRounds(res?.rounds);
                    setTitle(res?.jobTitle)
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching rounds:", err);
                setLoading(false);
            });
    }, [jobProfileId, jobID]);
    
    // console.log(rounds)
    return (
        <div className="p-6">
  <h2 className="text-2xl font-semibold mb-6">
    Job Rounds for <span className="text-purple-600">{title}</span>
  </h2>

  {loading ? (
    <LoadingGlobal text="Rounds" />
  ) : rounds.length === 0 ? (
    <div className="text-center text-gray-500 py-10">
      <p>No rounds found.</p>
    </div>
  ) : (
    <div className="space-y-6">
      {rounds.map((round: any) => (
        <div
          key={round.id}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {round.roundNumber}. {round.roundName}
                <span className="text-sm text-gray-500 ml-2">
                  ({round.roundType})
                </span>
              </h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <CalendarDays className="w-4 h-4 mr-1" />
                {new Date(round.roundDate).toLocaleDateString()}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <Button
                onClick={() =>
                  router.push(`/job/${jobProfileId || jobID}/evaluation/${round.id}`)
                }
                className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> Show Rubrics
              </Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          </div>

          <div className="mt-4 text-gray-700 text-sm leading-relaxed">
            {round.details}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

    );
};

export default RoundShow;
