import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib';
import jwt from 'jsonwebtoken';

export const GET = async (req: NextRequest) => {
  try {
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

   
    const token = authHeader.substring(7);

 
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { id: userId } = decodedToken;


    const cvs = await prisma.cV.findMany({
      where: { userId },
      include: {
        analysis: true, // Include CVAnalysis relation
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If no CVs are found, return a 404 response
    if (!cvs || cvs.length === 0) {
      return NextResponse.json({ message: 'No CVs found' }, { status: 404 });
    }

    // Respond with the CVs and their analyses
    return NextResponse.json(
      {
        message: 'CVs retrieved successfully',
        cvs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching CVs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
