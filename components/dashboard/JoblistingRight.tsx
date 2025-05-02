import { Edit } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { CalendarEvent } from 'react-bootstrap-icons';
import JobDrawer from './jobdetails/JobDrawer';
import { useUserStore } from '@/utils/userStore';
import { JobProfile } from '@prisma/client';
import { getRecruiterJobs } from '@/actions/createJobActions';
import Loading from '@/app/(protected)/(recruiter)/dashboard/loading';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

function JoblistingRight() {
    const [jobList, setJobs] = useState<JobProfile[] | null>(null);
    const { userData } = useUserStore();
    // sortdata
    const sortData = useSelector((state: RootState) => state.jobStateSort.sortBy)   

    const fetchJobs = useCallback(async () => {
        try {
            if (!userData?.id) return;
            const jobs = await getRecruiterJobs(userData.id) as JobProfile[];
            console.log("Fetched jobs:", jobs[0].jobDescription);
            setJobs(jobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            setJobs([]);
        }
    }, [userData?.id]);

    // useEffect to fetch jobs when userData.id changes
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);
    console.log(sortData)

    const joblistcontainser = React.useRef<HTMLDivElement>(null);
    const joblist_nodes = joblistcontainser.current?.childNodes;
    
    if (joblist_nodes) {
            Array.from(joblist_nodes).forEach((element) => {
                const status = (element as HTMLDivElement).querySelector("._status")?.textContent;

                if (sortData == "Completed" && status == "PENDING") {
                    (element as HTMLDivElement).classList.add("hidden");
                } else if (sortData == "Pending" && status == "COMPLETED") {
                    (element as HTMLDivElement).classList.add("hidden");
                } else {
                    (element as HTMLDivElement).classList.remove("hidden");
                }
            });
        }
    return (
        <div ref={joblistcontainser} className='overflow-hidden grid gap-5 text-sm pr-5 pb-32'>
            {joblist_nodes?.length==0&&<h1 className='text-center'>No Data Found</h1>}
            {jobList ? Array.from(jobList).map((element, index) => {
                return (
                    <JobDrawer key={element.id} job_data={element}>
                        <div className='joblisting overflow-y-auto p-5 border shadow-sm rounded-md flex items-center justify-around '>
                            <div className='grid gap-2 text-start'>
                                <div className='flex gap-4 items-center justify-between'>
                                    <h1 className='font-semibold text-lg '>{element.jobTitle}</h1>
                                    <span className={`_status ${element.status=="PENDING" ? "text-red-500" : "text-green-500"}`}>{element.status}</span>
                                </div>
                                <p className='description'>{element.jobDescription}</p>
                                <div className='flex gap-4 items-center justify-start'>
                                    <div className='meta-data flex gap-x-6 gap-y-4 items-center justify-start w-fit'>
                                        <CalendarEvent className='inline-block' /><input type='date' readOnly value={element.startDate.toISOString().split('T')[0]} className='border rounded-md p-2' />
                                    </div>
                                    <div className='tags inline-block w-fit border-l-2 pl-4 border-l-primary-foreground text-xs'>
                                        <span className='px-3 py-2 border rounded-md shadow-sm inline-block mr-2'>{element.jobRole}</span>
                                        <span className='px-3 py-2 border rounded-md shadow-sm inline-block mr-2'>{element.availability}</span>
                                        <span className='px-3 py-2 border rounded-md shadow-sm inline-block mr-2'>{element.company}</span>
                                        <span className='px-3 py-2 border rounded-md shadow-sm inline-block mr-2'>{element.location}</span>
                                    </div>
                                </div>

                            </div>
                            <div className='space-x-4 flex justify-end'>
                                <button className='border shadow-sm p-2 px-4 rounded-md flex gap-3 items-center hover:shadow-md'><Edit className='w-4 h-4 ' /> Edit</button>

                            </div>
                        </div>
                    </JobDrawer >
                );
            }) :
                <>
                    <Loading />
                </>}
        </div >
    );
}

export default JoblistingRight;