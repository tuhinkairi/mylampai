import { auth } from "@/lib/authlib";
import React from "react";

export default async function NewUserLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{userId:string | undefined}>;
}) {
  const user = await auth();
  params.userId = user?.id
  
  return <>{children}</>;
}
