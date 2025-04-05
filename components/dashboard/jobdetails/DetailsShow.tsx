import AdditionalDetails from "./nav-job-pages/AdditionalDetails";
import BasicDetailas from "./nav-job-pages/BasicDetailas";
import RecruitmentStages from "./nav-job-pages/RecruitmentStages";

function DetailsShow({ active_state }: { active_state: number }) {
    switch (active_state) {
        case 0:
            return <BasicDetailas/>
        case 1:

            return <RecruitmentStages/>
        case 2:
            return <AdditionalDetails/>

        default:
            return <BasicDetailas/>
    }
}

export default DetailsShow
