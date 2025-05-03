import React from 'react'
import { auth } from '@/lib/authlib';
import { redirect } from "next/navigation";

async function Layout({ children}: { children: React.ReactNode}) {
    const userData = await auth()
    // console.log(userData?.role)
    if(userData?.role!=="user"){
        redirect("/not-found");
    }
    return (

    <div>
        {children}
    </div>
  )
}

export default Layout
