import { RoundsForm } from "./rounds-form";

export default function JobProfilePage({
  params,
}: {
  params: {
    jobProfileId: string;
  } 
}) {
  return (
    <div>
      <div>
        <h2>Add more rounds</h2>
        <RoundsForm jobProfileId={params.jobProfileId}  />
      </div>
    </div>
  );
}
