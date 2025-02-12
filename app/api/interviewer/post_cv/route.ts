import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib'; // Adjust the path as per your project structure
import jwt from 'jsonwebtoken';

export const POST = async (req: NextRequest) => {
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

    const { id: userId} = decodedToken;

    const { Resume, JobDescription } = await req.json();

    if (!Resume || !JobDescription) {
      return NextResponse.json({ error: 'Resume and Job Description are required' }, { status: 400 });
    }

    const existingCV = await prisma.cV.findFirst({
      where: {
        userId,
        Resume,
        JobDescription,
      },
    });

    console.log("checking for existing cv:: ",existingCV)
    if (existingCV) {
      return NextResponse.json(
        { message: existingCV },
        { status: 409 }
      );
    }

    // Create a new CV entry
    const newCV = await prisma.cV.create({
      data: {
        Resume,
        JobDescription,
        userId,
      },
    });
    console.log("newcv: ",newCV)
    return NextResponse.json(
      { message: 'CV created successfully', cv: newCV },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating CV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};