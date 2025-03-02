import { getAllTalentMatches, getFavouriteTalents } from "@/actions/talentPoolActions";
import Offers from "./Offers";

export default async function page({
  params,
}: {
  params: { talentPoolId: string };
}) {
  const { talentPoolId } = await params;

  const res = await getAllTalentMatches(talentPoolId);
  // console.log("offers res:: ",res)
  return (
    <div>
      {/* <h1>Talent Pool Page</h1> */}

      {res ? (
        <div>
          <Offers offersSent={res.data} />
        </div>
      ) : (
        <div>No talents found</div>
      )}
    </div>
  );
}
