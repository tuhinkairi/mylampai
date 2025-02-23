"use client"
import TalentPoolForm from "./TalentPoolForm";
import InfiniteScrollComponent from "./InfiniteScroll";


export default function TalentPoolPage() {
  // const user = await auth();

  // if (!user || user.role !== "recruiter") {
  //   return <div>Unauthorized</div>;
  // }

  return (
    <div>
      <div>
        <h2>Create Talent Pool</h2>
        <TalentPoolForm />
        
      </div>
      {/* <div>
        <h1>Talent Pools</h1>
        <div className="flex gap-4 p-4">
          <InfiniteScrollComponent />
        </div>
      </div> */}
    </div>
  );
}
