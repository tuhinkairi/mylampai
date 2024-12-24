"use client";
import { useState } from "react";

const PracticeCards = () => {
  const [expanded, setExpanded] = useState<number>(1);

  const handleMouseEnter = (id: number) => {
    setExpanded(id);
  };

  return (
    <>
      <div className="bg-white max-w-[850px] w-full my-8 home-exp-card-container flex justify-start flex-col sm:flex-row items-center rounded-2xl border-2 border-[#eee] overflow-hidden">
        {/* <div className="flex justify-start flex-col sm:flex-row-reverse items-center rounded-2xl border-2 border-[#eee] overflow-hidden bg-red-50" > */}
        <div
          onMouseEnter={() => handleMouseEnter(1)}
          className={`group w-full border-y-2 sm:border-y-0 cursor-pointer min-h-[350px] flex p-4 gap-4 flex-col items-start justify-between overflow-hidden transition-all duration-400 ${
            expanded === 1
              ? "bg-[#CBDEF4] sm:max-w-[400px]"
              : "bg-white sm:max-w-[225px]"
          }`}
        >
          <h2 className="text-xl font-semibold">
            <span
              className={`text-base p-2 rounded-full duration-400 transition-all ${
                expanded === 1 ? "bg-white" : "bg-[#cbdef4]"
              }`}
            >
              &lt;/&gt;
            </span>
            <br />
            <br />
            Coding Practice
          </h2>
          <p className="max-w-[180px]">
            Practice coding problems from top comapnies
          </p>
          <div className="text-xs">400+ Questions</div>
          <button className="bg-primary text-sm text-white rounded-full px-4 py-2">
            Start Now{" "}
          </button>
        </div>

        <div
          onMouseEnter={() => handleMouseEnter(2)}
          className={`group w-full border-y-2 sm:border-y-0 sm:border-x-2 border-[#eee] cursor-pointer min-h-[350px] flex p-4 gap-4 flex-col items-start justify-between overflow-hidden transition-all duration-400 ${
            expanded === 2
              ? "bg-[#C8BBFF] sm:max-w-[400px]"
              : "bg-white sm:max-w-[225px]"
          }`}
        >
          <h2 className="text-xl font-semibold">
            <span
              className={`text-base p-2 rounded-full duration-400 transition-all ${
                expanded === 2 ? "bg-white" : "bg-[#c8bbff]"
              }`}
            >
              &lt;/&gt;
            </span>
            <br />
            <br />
            Ace Assessments
          </h2>
          <p className="max-w-[180px]">
            Practice & ace the hiring assessments of top companies
          </p>
          <div className="text-xs">400+ Questions</div>
          <button className="bg-primary text-sm text-white rounded-full px-4 py-2">
            Start Now{" "}
          </button>
        </div>

        <div
          onMouseEnter={() => handleMouseEnter(3)}
          className={`group w-full border-y-2 sm:border-y-0 cursor-pointer min-h-[350px] flex p-4 gap-4 flex-col items-start justify-between overflow-hidden transition-all duration-400 ${
            expanded === 3
              ? "bg-[#fff1cc] sm:max-w-[400px]"
              : "bg-white sm:max-w-[225px]"
          }`}
        >
          <h2 className="text-xl font-semibold">
            <span
              className={`text-base p-2 rounded-full duration-400 transition-all ${
                expanded === 3 ? "bg-white" : "bg-[#fff1cc]"
              }`}
            >
              &lt;/&gt;
            </span>
            <br />
            <br />
            Interview Prep
          </h2>
          <p className="max-w-[180px]">
            Prepare for interviews with mock interviews & feedback
          </p>
          <div className="text-xs">400+ Questions</div>
          <button className="bg-primary text-sm text-white rounded-full px-4 py-2">
            Start Now{" "}
          </button>
        </div>
      </div>
    </>
  );
};

const PracticeCoding = () => {
  return (
    <>
      <h4 className="pt-4 font-semibold text-[#8C52FF]">
        PATH TO SUCCESS
        <div className="bg-[#8C52FF] w-6 h-6 blur-sm rounded-full absolute left-0 translate-x-[-14px] translate-y-[-100%] "></div>
      </h4>
      <div className="text-2xl md:text-3xl font-medium mt-8 mb-4">
        Valuable Features at Your Fingertips, Completely Free!
      </div>
      <p className="text-sm md:text-base text-muted-foreground font-medium my-4">
        Empowering talent like you in your career journey has never been easier.
        With just one tap, you can access all the tools you need, and the best
        part? It&apos;s completely free! You don&apos;t have to pay even a
        single rupee to use Wize.
      </p>
      <PracticeCards />
    </>
  );
};

export default PracticeCoding;
