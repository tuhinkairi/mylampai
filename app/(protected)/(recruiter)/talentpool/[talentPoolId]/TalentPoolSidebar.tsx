import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { NavUser } from '@/components/global/nav-user';
import NavMain from '@/components/talentPool/sidebar/nav-main';

interface TalentPoolSidebarProps {
  talentPoolId: string;
}

export default function TalentPoolSidebar({ talentPoolId }: TalentPoolSidebarProps) {
  return (
    <div className="hidden sm:flex flex-col items-center justify-between py-4 max-w-20 w-full">
      <div className="flex items-center flex-col gap-4">
        <Link href={'/talentpool'} className="shadow-lg">
          <Image
            src={"/sidebar/wize_logo_whitebg.svg"}
            alt="wiZe logo"
            width={50}
            height={50}
          />
        </Link>
        <NavMain talentPoolId={talentPoolId} />
      </div>
      <NavUser />
    </div>
  );
}