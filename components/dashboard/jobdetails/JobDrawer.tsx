"use client"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import React, { useEffect, useRef, useState } from "react"
import DetailsShow from "./DetailsShow"
import { JobProfile } from "@prisma/client"
// import { DialogTitle } from "@/components/ui/dialog"

function JobDrawer({ children, job_data }: { children: React.ReactNode, job_data: JobProfile }) {
    const [active, setActive] = useState<number>(0)
    const initial = useRef<HTMLButtonElement>(null)
    const handel_active = (e: number) => {
        setActive(e)
    }
    
    return (
        <div>
            <Sheet modal={true}>
                <SheetTrigger>{children}</SheetTrigger>
                <SheetContent className="min-w-full md:min-w-[80%] overflow-y-auto">
                    <SheetHeader>
                        {/* navigation */}
                        {/* <DialogTitle className="text-center">Job Title</DialogTitle> */}
                            <nav className="_jobNav flex items-center justify-center gap-4 text-sm pb-2 border-b">
                                <button key={0} ref={initial} onFocus={() => handel_active(0)} className="focus:border-b-2 py-2 px-4 focus:border-b-primary border-b-2 border-b-transparent ">Basic Details</button>
                                <button key={1} onFocus={() => handel_active(1)} className="focus:border-b-2 py-2 px-4 focus:border-b-primary border-b-2 border-b-transparent">Recruitment Stages</button>
                                <button key={2} onFocus={() => handel_active(2)} className="focus:border-b-2 py-2 px-4 focus:border-b-primary border-b-2 border-b-transparent">Additional Details</button>
                            </nav>
                    </SheetHeader>
                    {/* details show help to list the option components as per the active number */}
                    <DetailsShow active_state={active} job_data={job_data}/>
                </SheetContent>

            </Sheet>
        </div>
    )
}

export default JobDrawer
