import { getRecruiterJobs } from '@/actions/createJobActions';

import { JobProfile } from "@prisma/client";
import React from 'react'
import { JobCard } from './jobCard';
import { auth } from '@/lib/authlib';

async function page() {
    const user = await auth();
    const jobs = await getRecruiterJobs(user?.id ? user?.id : "") as JobProfile[];
    return (
        <div className="grid grid-cols-3 gap-5 p-4">
            {jobs.map((job, index) => (
                <JobCard key={index} job={job} />
            ))}
        </div>
    )
}

export default page;
