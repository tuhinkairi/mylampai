"use client"
import { Loader2 } from 'lucide-react'
import React from 'react'

import { useEffect, useState } from 'react';

function LoadingGlobal(params: Promise<{ text: string | undefined }>) {
  const [text, setText] = useState<string | undefined>();

  useEffect(() => {
    params.then((data) => setText(data.text));
  }, [params]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">Loading {text}...</p>
      </div>
    </div>
  );
}

export default LoadingGlobal;
