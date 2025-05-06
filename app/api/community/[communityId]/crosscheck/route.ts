import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib'; // Adjust the path as per your project structure
import jwt from 'jsonwebtoken';

export const POST = async (req: NextRequest, { params }: { params: Promise<{ communityId: string }> }) => {
  try {
    // const authHeader = req.headers.get('Authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // const token = authHeader.substring(7); 

    // let decodedToken: any;
    // try {
    //   decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    // } catch (error) {
    //   console.error('JWT verification error:', error);
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // const { id: userId } = decodedToken;
    // const community = await prisma.community.findUnique({
    //   where: { id: params.communityId },
    // });

    // if (!community) {
    //   return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    // }

    // if (community.userIds.includes(userId)) {
    //   return NextResponse.json({ exists: true, message: "User is in the Community" }, { status: 201 });
    // }

    // return NextResponse.json({ exists: false, message: "User is not in the Community" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
