import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '../ui/button'
import JobForm from '@/app/(protected)/(recruiter)/job/JobForm'


export default function AddJobsMini() {
    return (
        <Sheet>
            <div className='pt-5 pl-4'>
                <SheetTrigger><Button className='hover:bg-primary-dark inline-block text-sm '>Add Job</Button></SheetTrigger>
            </div>
            <SheetContent className='min-w-[70vw] overflow-y-auto'>
                <SheetHeader >
                    <SheetTitle className='text-center'>Create Job</SheetTitle>
                </SheetHeader>
                {/* <SheetDescription>
                </SheetDescription> */}
                <JobForm />
            </SheetContent>
        </Sheet>
    )
}
