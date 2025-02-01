import { NextRequest } from "next/server";

const {getCandidateProfile} =require('@/actions/talentPoolActions')

export async function GET(req: NextRequest, { params }:{params:{candidateId:string}}) {
    const tpData = await getCandidateProfile(params.candidateId);
    // if (!tpData) {
    //   return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    // }
  
    return new Response(tpData, { status: 200 });
  }