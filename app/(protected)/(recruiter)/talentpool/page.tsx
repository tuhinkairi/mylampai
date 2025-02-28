"use server"
import TalentPoolForm from "./TalentPoolForm";
import ListTalentPool from "./TalentPoolsListing";
import { auth } from "@/lib/authlib";


export default async function TalentPoolPage() {
  const user = await auth();

  if (!user || user.role !== "recruiter") {
    return <div>Unauthorized</div>;
  }

  return (
    <div>
      <div>
        <h2>Create Talent Pool</h2>
        <TalentPoolForm />
      </div>
      <div>
        <h1>Talent Pools</h1>
        <div className="flex flex-wrap justify-between gap-2 p-4">
          <ListTalentPool userId={user.id} />
        </div>
      </div>
    </div>
  );
}
