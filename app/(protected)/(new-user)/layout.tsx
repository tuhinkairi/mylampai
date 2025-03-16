"use client"
import { useUserStore } from "@/utils/userStore";
import React from "react";

export default function NewUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const {userData} = useUserStore();
  // console.log(userData?.id);
  // params.userId = userData?.id;


  return <>{children}</>;
}
