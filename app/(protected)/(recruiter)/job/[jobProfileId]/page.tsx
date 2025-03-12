import { RoundsForm } from "./rounds-form";

export default async function JobProfilePage({
  params,
}: {
  params: {
    jobProfileId: string;
  } 
}) {
  const param= await params;
  const jobProfileId = param.jobProfileId;
  return (
    <div>
      <div>
        <h2>Add more rounds</h2>
        <RoundsForm jobProfileId={jobProfileId}  />
      </div>
    </div>
  );
}
