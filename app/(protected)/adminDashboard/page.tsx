"use client";
import { useState } from "react";
import AdminDashboard from "./dashboard";
import SentMailsList from "./SentMailsList";
import EmailStats from "./EmailStats";

export default function Adminpage() {
  const [Stats, setStats] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState("");

  const handleStatsChange = (id : string) => {
    setSelectedNewsletter(id);
    setStats(true);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {Stats ? (<div className="flex-1 overflow-y-auto bg-gray-100 p-4"><EmailStats newsletterId={selectedNewsletter} onBack={() => { setStats(!Stats) }} /></div>) : (<div className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <AdminDashboard />
      </div>)}

      <div className="md:w-[600px] flex-shrink-0 bg-white border-l border-gray-300 h-full overflow-y-auto">
        <h2 className="text-center text-violet-500 font-semibold text-2xl bg-gray-100 p-4">Emails sent</h2>
        <SentMailsList Status={handleStatsChange} />
      </div>
    </div>
  )
}