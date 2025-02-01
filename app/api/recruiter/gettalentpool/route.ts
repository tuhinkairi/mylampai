import { NextRequest } from "next/server";

const {getRecruiterTalentPool} =require('@/actions/talentPoolActions')

export async function GET(req: NextRequest, { params }:{params:{searchParameter:object}}) {
    const url = new URL(req.url);

    const tpData = await getRecruiterTalentPool(params.searchParameter,url);
    // if (!tpData) {
    //   return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    // }
  
    return new Response(tpData, { status: 200 });
  }