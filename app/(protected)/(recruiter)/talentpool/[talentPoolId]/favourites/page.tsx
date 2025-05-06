import { getFavouriteTalents } from "@/actions/talentPoolActions";
import Favourites from "./Favourites";

export default async function Page({
  params,
}: {
  params: { talentPoolId: string };
}) {
  const { talentPoolId } = params;

  const res = await getFavouriteTalents(talentPoolId);

  return (
    <div>
      {res ? (
        <div>
          <Favourites favouriteTalents={res.data} />
        </div>
      ) : (
        <div>No talents found</div>
      )}
    </div>
  );
}
