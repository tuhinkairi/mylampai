"use client";
import JoblistingRight from "@/components/dashboard/JoblistingRight";
import TemplateRIght from "../../../../components/dashboard/TemplateRIght";
import { useState } from "react";
import AddJobsMini from "@/components/Jobs/add-jobs-mini";
import { BarChart, LucideVerified } from "lucide-react";
import { RiLiveLine } from "react-icons/ri";
import { ExclamationCircle } from "react-bootstrap-icons";
import { useDispatch } from "react-redux";
import { setSortBy } from "@/lib/features/jobSlice/sortSlice";

export default function Dashboard() {
  const [state, SetState] = useState<boolean>(false)
  const dispatch = useDispatch()
  const handelMiniJob = () => {
    SetState(!state)
  }
  const handleSortChange = (sortBy: 'Default' | 'Completed' | 'Pending') => {
    dispatch(setSortBy(sortBy));
  };
  return (
    <>
      <section className="pb-3 grid md:grid-cols-3 md:grid-rows-5 items-start justify-center  gap-5 gap-x-3 h-screen overflow-hidden text-gray-700">
        {/* top section */}
        <div className="col-span-2 sm:col-span-3 grid grid-cols-3 ">
          <div className="col-span-1 overflow-hidden sm:grid hidden">
            <AddJobsMini classnames="min-w-full px-2 pt-4 mx-0 h-full " />
          </div>
          <div className="col-span-2 ">
            <div className="pr-5 pl-1 mr-4 ">
              <AddJobsMini classnames="float-right mt-3 " />
            </div>
            <div className="flex items-center justify-between w-full pr-10 pl-1 ">
              <input
                type="text"
                className="border p-2 text-sm rounded-md shadow-sm w-full md:w-1/2"
                placeholder="Search..."
                value={""}

              // onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex items-center gap-3 text-gray-500">
                <button onClick={()=>handleSortChange("Default")} className="flex gap-2 items-center text-sm font-semibold ">
                  <BarChart className="-rotate-90" width={20} height={20} />
                  <span className="">All</span>
                </button>
                <button onClick={()=>handleSortChange("Completed")} className="flex gap-2 items-center text-sm font-semibold ">
                  <LucideVerified width={20} height={20} />
                  <span className="">Live</span>
                </button>
                <button onClick={()=>handleSortChange("Pending")} className="flex gap-2 items-center text-sm font-semibold ">
                  <ExclamationCircle width={16} height={16} />
                  <span className="">Incomplete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* end topsection */}

        {/* left section */}
        <div className="hidden md:grid border rounded-md pb-4 row-span-4 h-full mb-3">
          <TemplateRIght />
        </div>
        {/* right section */}
        <div className="col-span-2 max-h-screen overflow-y-auto w-full row-span-4 ">
          <JoblistingRight />
        </div>
      </section>
    </>
  );
}
