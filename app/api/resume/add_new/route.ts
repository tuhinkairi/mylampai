import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib"; // Adjust the path as per your project structure
import jwt from "jsonwebtoken";
import { uploadFileToAzure } from "@/actions/uploadActions";

import crypto from "crypto";

const hashFile = async (file: File): Promise<string> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  return hash;
};

export const POST = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
      console.error("JWT verification error:", error);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = decodedToken;

    const formData = await req.formData();

    const resumeFile = formData.get("resumeFile") as File;
    const jobDescription = formData.get("jobDescription") as string | null;
    const resumeFileText = formData.get("resumeFileText") as string | null;

    if (!resumeFile) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 }
      );
    }
    const resumeHash = await hashFile(resumeFile);

    if (!resumeHash) {
      return NextResponse.json(
        { error: "Invalid resume file" },
        { status: 400 }
      );
    }

    const existingCV = await prisma.resume.findFirst({
      where: {
        userId,
        resumeHash,
      },
    });

    console.log("checking for existing cv:: ", existingCV);
    if (existingCV) {
      return NextResponse.json({ resume: existingCV, status: 409 });
    }

    // Create a new CV entry
    const resumeName =
      "resume_" + new Date().toISOString() + "_" + userId + ".pdf";

    const resumeUrl = await uploadFileToAzure(resumeFile, resumeName);
    if (!resumeUrl) {
      return NextResponse.json(
        { error: "Failed to upload resume" },
        { status: 500 }
      );
    }
    const resumeOriginalName = resumeFile.name;
    console.log("resumeSize: ", resumeFile.size);
    const newCV = await prisma.resume.create({
      data: {
        userId,
        resumeName: resumeOriginalName,
        resumeUrl,
        resumeHash,
        resumeFileText: resumeFileText || null,
      },
    });
    return NextResponse.json({ resume: newCV, status: 200 });
  } catch (error) {
    console.error("Error creating CV:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
