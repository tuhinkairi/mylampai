"use client";
import { useState, ChangeEvent } from "react";
import StepOneTwo from "./StepOneTwo";

import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./StepThree"), { ssr: false });

const Page: React.FC = () => {
  const [step, setStep] = useState(1);


  const handleNextClick = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handleBackClick = () => {
    setStep((prevStep) => prevStep - 1);
  };




  return (
    <div className="w-full">
      {step === 1 || step === 2 ? (
        <StepOneTwo
          step={step}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
        />
      ) : (
        <PDFViewer
        />
      )}
    </div>
  );
};

export default Page;
