"use client";
import JoblistingRight from "@/components/dashboard/JoblistingRight";
import TemplateRIght from "../../../../components/dashboard/TemplateRIght";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddJobsMini from "@/components/Jobs/add-jobs-mini";

export default function Dashboard() {
  const [state, SetState] = useState<boolean>(false)
  const handelMiniJob = () => {
    SetState(!state)
  }

  return (
    <>
      <section className="grid md:grid-cols-3 items-start justify-center gap-x-5 h-screen overflow-hidden">
        {/* left section */}
        <div className="hidden md:grid border-x">
          <AddJobsMini classnames="min-w-full" />
          <TemplateRIght />

        </div>
        <div className="col-span-2">
          <div className='btn-secton p-5 flex justify-end'>
            <AddJobsMini classnames="min-w-full" />
          </div>
          <div className=" max-h-screen overflow-y-auto w-full pb-24">
            <JoblistingRight />
          </div>
        </div>
      </section>
    </>
  );
}
