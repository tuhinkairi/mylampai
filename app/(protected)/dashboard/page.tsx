import JoblistingRight from "@/components/dashboard/JoblistingRight";
import TemplateRIght from "../../../components/dashboard/TemplateRIght";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return <section className="grid md:grid-cols-3 items-center justify-center gap-5 h-screen overflow-hidden">
    {/* left section */}
    <div className="hidden md:grid col-span-1 h-full">
      <TemplateRIght />
    </div>
    <div className="col-span-2">
      <div className='btn-secton p-5 flex justify-end'>
        <Button className='hover:bg-primary-dark'>
          Add Job
        </Button>
      </div>
      <div className=" max-h-screen overflow-y-auto w-full pb-24">
        <JoblistingRight />
      </div>
    </div>
  </section>;
}
