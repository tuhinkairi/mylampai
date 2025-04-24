import { NextRequest } from "next/server";

const {getCandidateProfile} =require('@/actions/talentPoolActions')

export async function GET(req: NextRequest, { params }:{params:Promise<{candidateId:string}>}) {
    const resolvedParams = await params;
    const tpData = await getCandidateProfile(resolvedParams.candidateId);
    // if (!tpData) {
    //   return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    // }
  
    return new Response(tpData, { status: 200 });
  }