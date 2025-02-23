import { auth } from "@/lib/authlib";
import { redirect } from "next/navigation";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await auth();

  if (user&&user.role!="recruiter") {
    redirect("/talentmatch");
  }else{
    redirect("/talentpool")
  }

  return (
    <>
      <main className="h-full">{children}</main>
    </>
  );
}
