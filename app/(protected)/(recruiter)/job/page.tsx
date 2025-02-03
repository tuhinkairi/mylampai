import JobForm from "./JobForm";
import { JobCard } from "./jobCard";
import { getRecruiterJobs } from "@/actions/createJobActions";
import { auth } from "@/lib/authlib";
import { JobProfile } from "@prisma/client";

export default async function CreateJobPage() {
  const user = await auth();

  if (!user) {
    return <h1>Not authorized</h1>;
  }

  const jobs = await getRecruiterJobs(user.id) as JobProfile[];

  return (
    <div>
      <div className="flex">
        {jobs.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}
      </div>
      <JobForm />
    </div>
  );
}
