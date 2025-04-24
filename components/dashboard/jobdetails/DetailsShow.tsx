import { JobProfile } from "@prisma/client";
import AdditionalDetails from "./nav-job-pages/AdditionalDetails";
import BasicDetails from "./nav-job-pages/BasicDetails";
import RecruitmentStages from "./nav-job-pages/RecruitmentStages";

function DetailsShow({ active_state, job_data }: { active_state: number, job_data?: JobProfile }) {
    switch (active_state) {
        case 0:
            return <BasicDetails job_data={job_data}/>
        case 1:

            return <RecruitmentStages/>
        case 2:
            return <AdditionalDetails/>

        default:
            return <BasicDetails job_data={job_data}/>
    }
}

export default DetailsShow
