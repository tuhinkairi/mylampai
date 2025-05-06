import { getFavouriteTalents } from "@/actions/talentPoolActions";
import Favourites from "./Favourites";

export default async function page({
  params,
}: {
  params: { talentPoolId: string };
}) {
  const { talentPoolId } = params;

  const res = await getFavouriteTalents(talentPoolId);
//   console.log("res:: ",res)
  return (
    <div>
      {/* <h1>Talent Pool Page</h1> */}

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
