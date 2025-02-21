import prisma from "@/lib";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { RoundId } = await req.json();

        if (!RoundId) {
            return NextResponse.json({ status: "failed", message: "Missing RoundId" }, { status: 400 });
        }

        const rubrics = await prisma.jobRoundRubric.findMany({
            where: {
                jobRoundId: RoundId, // Assuming RoundId is referring to jobRoundId
            },
        });
        console.log("data", rubrics)

        return NextResponse.json({ status: "success", data: rubrics });
    } catch (error) {
        console.error("Error fetching rubrics:", error);
        return NextResponse.json({ status: "failed", message: "Internal Server Error", error }, { status: 500 });
    }
}


// Update Rubric
export async function PUT(req: Request) {
    try {
        const { id, parameter, description, weightage, type, condition } = await req.json();

        if (!id) return NextResponse.json({ status: "failed", message: "Missing Rubric ID" }, { status: 400 });

        const updatedRubric = await prisma.jobRoundRubric.update({
            where: { id },
            data: { parameter, description, weightage, type, condition, updatedAt: new Date() },
        });

        return NextResponse.json({ status: "success", data: updatedRubric });
    } catch (error) {
        console.error("Error updating rubric:", error);
        return NextResponse.json({ status: "failed", message: "Internal Server Error" }, { status: 500 });
    }
}

//  Delete Rubric
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) return NextResponse.json({ status: "failed", message: "Missing Rubric ID" }, { status: 400 });

        await prisma.jobRoundRubric.delete({ where: { id } });

        return NextResponse.json({ status: "success", message: "Rubric deleted successfully" });
    } catch (error) {
        console.error("Error deleting rubric:", error);
        return NextResponse.json({ status: "failed", message: "Internal Server Error" }, { status: 500 });
    }
}
