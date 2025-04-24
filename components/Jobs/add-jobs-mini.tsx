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


export default function AddJobsMini(props:{classnames?:string}) {
    return (
        <Sheet>

            <div className=''>
                <SheetTrigger className={`${props.classnames?props.classnames:"pt-5 pl-4"}`}><Button className={`hover:bg-primary-dark inline-block text-sm ${props.classnames?props.classnames:""}`}>Add Job</Button></SheetTrigger>

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
