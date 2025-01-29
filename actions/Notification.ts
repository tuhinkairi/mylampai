import prisma from "@/lib";


export const pushnotification = async (userId: string,message:string,recruiterId:string) => {
  try {
    if (!userId||recruiterId) return [];

   const pushnotification=await prisma.notification.create({
    data:{
        userId:userId,
        message,
        recruiterId
    }
   })
   return{
    pushnotification
   }
  } catch (error) {
    console.log("Error: ", error);
  }
  return [];
};
export const getNotification=async(userId:string)=>{
    if(!userId){
        return []
    }
    const notification=await prisma.notification.findMany({
        where:{
            userId
        }
    })
    return notification
}