import React from 'react';
import TalentPoolSidebar from './TalentPoolSidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default async function TalentPoolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ talentPoolId: string }>;
}) {
    const { talentPoolId } = await params;
  return (
    <div className="flex">
      <TalentPoolSidebar talentPoolId={talentPoolId} />
      <ScrollArea className="h-screen w-full flex flex-1 flex-col">
        {children}
      </ScrollArea>
    </div>
  );
}