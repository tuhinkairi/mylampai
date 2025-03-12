import JobForm from "./JobForm";
import { auth } from "@/lib/authlib";

export default async function CreateJobPage() {
  const user = await auth();

  if (!user) {
    return <h1>Not authorized</h1>;
  }

  return (
    <div>
      <JobForm />
    </div>
  );
}
