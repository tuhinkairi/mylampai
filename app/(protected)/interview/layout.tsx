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
  if (!user) {
    redirect("/not-found");
  }
  // console.log("user found ", user)

  const isTalentProfileExist = await prisma.talentProfile.findFirst({
    where: {
      userId: user?.id,
    }
  });

  if (user?.role === "user") {
    // console.log("isTalentProfileExist: ", isTalentProfileExist)
    if (!isTalentProfileExist) {
      redirect("/create-profile");
    } else {
      // console.log("Talent Profile Exist")
    }
  } else if (user?.role === "recruiter") {
    redirect("/recruit")
  }


  return <>{children}</>;
}
