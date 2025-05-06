import { getTalentPoolData } from "@/actions/talentPoolActions";
import ProfileMatches from "./ProfileMatches";

export default async function TalentPoolPage({
  params,
}: {
  params: Promise<{ talentPoolId: string }>;
}) {
  const { talentPoolId } = await params;

  const res = await getTalentPoolData(talentPoolId);
  // console.log("res:: ",res)
  return (
    <div>
      {/* <h1>Talent Pool Page</h1> */}

      {res ? (
        <div>
          <ProfileMatches poolData={res} />
        </div>
      ) : (
        <div>No talents found</div>
      )}
    </div>
  );
}
