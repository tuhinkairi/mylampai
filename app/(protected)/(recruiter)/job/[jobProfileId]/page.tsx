"use client";

import { RoundsForm } from "./rounds-form";
import { use } from "react";

export default function JobProfilePage({
  params,
}: {
  params: Promise<{
    jobProfileId: string;
  }>;
}) {
  const { jobProfileId } = use(params);

  return (
    <div>
      <div>
        <h2>Add more rounds</h2>
        <RoundsForm jobProfileId={jobProfileId} />
      </div>
    </div>
  );
}
