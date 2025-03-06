"use server"
import prisma from "@/lib/index";
import { auth } from "@/lib/authlib";
import { redirect } from "next/navigation";
import { useUserStore } from "@/utils/userStore";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await auth();
  
  if (!user || user?.role !== "user") {
    redirect("/not-found");
  }
  console.log("user found ",user)
  
  const isTalentProfileExist=await prisma.talentProfile.findFirst({
    where: {
      userId: user?.id,
    },
  });
  
  // console.log("isTalentProfileExist: ", isTalentProfileExist)
  if (!isTalentProfileExist) {
    redirect("/create-profile");
  } else {
    console.log("Talent Profile Exist with userId: ", user?.id);
  }

  return <>{children}</>;
}
