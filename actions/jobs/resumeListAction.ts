import prisma from "@/lib";


export const addNewUserResume=async (resume: any)=>{
    try {
        const response = await prisma.resumeList.create({
            data: resume
        });
        return response;
    } catch (error) {
        console.error("Error adding resume:", error);
        throw error;
    }
}


