"use client";
import { getRecruiterJobs } from "@/actions/createJobActions";
import { JobProfile } from "@prisma/client";
import React, { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/utils/userStore";
import LoadingGlobal from "@/components/ui/loading";
import { JobCard } from "./jobCard";
import AddJobsMini from "@/components/Jobs/add-jobs-mini";

export default function ShowJobs() {
    const [jobList, setJobs] = useState<JobProfile[] | null>(null);
    const { userData } = useUserStore();

    // Memoize fetchJobs using useCallback to prevent unnecessary re-creation
    const fetchJobs = useCallback(async () => {
        try {
            if (!userData?.id) return;
            const jobs = await getRecruiterJobs(userData.id) as JobProfile[];
            console.log("Fetched jobs:", jobs);
            setJobs(jobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            setJobs([]); // Ensure it doesn't stay null
        }
    }, [userData?.id]); // Only re-create when userData.id changes

    // useEffect to fetch jobs when userData.id changes
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]); // Dependency on fetchJobs

    return (
        <>
            <AddJobsMini />
            {!jobList ? (
                <LoadingGlobal text="Fetching jobs..." key={userData?.id} />
            ) : jobList.length > 0 ? (
                <div className="grid grid-cols-3 gap-5 p-4">
                    {jobList.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No jobs found.</p>
            )}
        </>
    );
}
