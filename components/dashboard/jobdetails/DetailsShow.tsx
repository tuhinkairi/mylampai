import AdditionalDetails from "./nav-job-pages/AdditionalDetails";
import BasicDetails from "./nav-job-pages/BasicDetails";
import RecruitmentStages from "./nav-job-pages/RecruitmentStages";

function DetailsShow({ active_state }: { active_state: number }) {
    switch (active_state) {
        case 0:
            return <BasicDetails/>
        case 1:

            return <RecruitmentStages/>
        case 2:
            return <AdditionalDetails/>

        default:
            return <BasicDetails/>
    }
}

export default DetailsShow
