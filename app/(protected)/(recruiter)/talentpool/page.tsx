import TalentPoolForm from "./TalentPoolForm";
import { auth } from "@/lib/authlib";
import InfiniteScrollComponent from "./InfiniteScroll";

export default async function TalentPoolPage() {
  const user = await auth();

  if (!user || user.role !== "recruiter") {
    return <div>Unauthorized</div>;
  }

  return (
    <div>
      <div>
        <h1>Talent Pools</h1>
        <div className="flex gap-4 p-4">
          <InfiniteScrollComponent />
        </div>
      </div>
      <div>
        <h2>Create Talent Pool</h2>
        <TalentPoolForm />
      </div>
    </div>
  );
}
