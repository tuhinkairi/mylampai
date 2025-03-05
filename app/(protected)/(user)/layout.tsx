"use server"
import prisma from "@/lib/index";
import { auth } from "@/lib/authlib";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await auth();

  const isTalentProfileExist=await prisma.talentProfile.findFirst({
    where: {
      userId: user?.id,
    },
  });
  console.log("user found ",user)
  // if (!user || user?.role !== "user") {
  //   redirect("/not-found");
  // }
  if (!user?.role) {
    redirect("/not-found");
  }
  
  // console.log("isTalentProfileExist: ", isTalentProfileExist)
  if (!isTalentProfileExist) {
    redirect("/create-profile");
  } else {
    console.log("Talent Profile Exist with userId: ", user?.id);
  }

  return <>{children}</>;
}
