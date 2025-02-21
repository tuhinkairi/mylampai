import JobForm from "./JobForm";
import { JobCard } from "./jobCard";
import { getRecruiterJobs } from "@/actions/createJobActions";
import { auth } from "@/lib/authlib";

export default async function CreateJobPage() {
  const user = await auth();

  if (!user) {
    return <h1>Not authorized</h1>;
  }

  const res = await getRecruiterJobs(user.id);
  console.log(res)
  // {res.status === "success" ? (
  //   <div className="flex">
  //     {res.data?.map((job, index) => (
  //       <JobCard key={index} job={job} />
  //     ))}
  //   </div>
  // ) : (
  //   <>
  //     <h1>Failed to fetch jobs</h1>
  //   </>
  // )}
  return (
    <div className="grid grid-cols-5 justify-center p-5 max-h-screen overflow-hidden overflow-y-auto">
      <div className="gird col-span-1 gap-4 max-h-screen overflow-hidden overflow-y-auto">
        <h1 className="text-center text-xl">Created Jobs</h1>
        {res.status === "success" ? (
          <div className="flex flex-wrap gap-3 overflow-y-auto py-4">
            {res.data?.map((job, index) => (
              <JobCard key={index} job={job} />
            ))}
          </div>
        ) : (
          <>
            <h1>Failed to fetch jobs</h1>
          </>
        )}
      </div>
      <div className="col-span-4">
        <JobForm />
      </div>
    </div>
  );
}
