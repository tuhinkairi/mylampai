"use client";
import React, { useState, useEffect, useCallback } from "react";
import InterviewPage from "./InterviewPage";




const InterviewComponent = () => {


  return (
    <>
      <div className="min-h-screen bg-primary-foreground flex items-center md:justify-center justify-top w-full relative">
        <InterviewPage />
      </div>
    </>
  );
};

export default InterviewComponent;
