import { getJob } from '@/actions/careerActions'
import { RoundsType } from '@/actions/createJobActions'
import RoundShow from '@/app/(protected)/(recruiter)/job/[jobProfileId]/evaluation/RoundShow'
import { RootState } from '@/lib/store'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

function RecruitmentStages() {
    // const job_id = useSelector((state:RootState) => state.job.id)
    // // const [rounds, setRounds] = React.useState<RoundsType[]>()
    // console.log(job_id)
    // // fetchrounds
    // // useEffect(() => {},[job_id])
    //  getJob(job_id).then((res) => {
    //                 if (res?.rounds) {
    //                     console.log(res.rounds)
    //                     // setRounds(res?.rounds);
    //                 }
    //                 // setLoading(false);
    //             })
    //             .catch((err) => {
    //                 console.error("Error fetching rounds:", err);
    //                 // setLoading(false);
    //             });
    return (
        <div className='content-center text-center'>
            <RoundShow/>

        </div>
    )
}

export default RecruitmentStages
