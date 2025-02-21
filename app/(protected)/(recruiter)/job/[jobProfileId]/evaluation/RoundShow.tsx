"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getJob } from "@/actions/careerActions"; // Replace with your actual API function
import RubricList from "./RubricsList";
import { getRubricsList } from "@/actions/jobs/rubricsGet";

interface Round {
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
const RoundShow = () => {
    const { jobProfileId } = useParams<{ jobProfileId: string }>();
    const [rounds, setRounds] = useState<Round[] | any>([]);
    const [title, setTitle] = useState<string>("")
    const [loading, setLoading] = useState(true);
    const router = useRouter()
    const [rubricsShow, setRubricsShow] = useState<boolean>(false);
    const [rubricsId, setRubricsId] = useState<string>();
    const [rubricsData, setRubricsData] = useState<JobRoundRubric[]>();

    useEffect(() => {
        if (!jobProfileId) return;

        getJob(jobProfileId)
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
    }, [jobProfileId]);
    
    // console.log(rounds)
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Job Rounds for {title}</h2>
            {loading ? (
                <p>Loading rounds...</p>
            ) : rounds.length === 0 ? (
                <p>No rounds found.</p>
            ) : (
                <ul className="space-y-4">
                    {rounds.map((round) => (
                        <li
                            key={round.id}
                            className="p-4 border rounded-lg shadow-sm bg-gray-50"
                        >
                            <h3 className="text-lg font-semibold">
                                {round.roundNumber}. {round.roundName} ({round.roundType})
                            </h3>
                            <p className="text-sm text-gray-600">
                                Date: {new Date(round.roundDate).toLocaleDateString()}
                            </p>
                            <p className="mt-2">{round.details}</p>
                            <p className="mt-2">Round: {round.roundNumber}</p>
                            <div className="mt-5">
                                <button onClick={() =>router.push(`/job/${jobProfileId}/evaluation/${round.id}`)}
                                    className="border rounded-md p-2 bg-purple-400 hover:bg-purple-500 text-white">show rubics</button><button className="border rounded-md p-2 bg-red-400 hover:bg-red-500 ml-2 text-white" >delete</button></div>
                            
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RoundShow;
