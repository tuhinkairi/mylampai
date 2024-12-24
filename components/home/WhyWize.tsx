"use client";
import { useState } from "react";
import ExperiencedCounsellors from "./ExperiencedCounsellors";
import PracticeCoding from "./PractiseCoding";
import WizeCampLink from "./WizeCampLink";
import Image from "next/image";

const whyWizeLinks = [
  { id: "allroundguidance", text: "A Complete Solution" },
  { id: "pathtosuccess", text: "Path To Success" },
  { id: "smartestplatform", text: "The Smartest Platform" },
  { id: "expertsinsights", text: "People's Choice" },
  // { id: "advancedfeatures", text: "Advanced Features" },
];

export default function WhyWize() {
  const [active, setActive] = useState("allroundguidance");

  // Create a ref array for each section
  // const sectionsRef = useRef(new Array(whyWizeLinks.length).fill(null));

  // Initialize animation controls for each section at the top level
  // const controls0 = useAnimation();
  // const controls1 = useAnimation();
  // const controls2 = useAnimation();
  // const controls3 = useAnimation();
  // const controls4 = useAnimation();

  // const controls = [controls0, controls1, controls2, controls3, controls4];

  // useEffect(() => {
  // Intersection Observer setup
  // const observer = new IntersectionObserver(
  //   (entries) => {
  //     entries.forEach((entry) => {
  //       if (entry.isIntersecting) {
  //         setActive(entry.target.id);
  //         const index = whyWizeLinks.findIndex(
  //           (link) => link.id === entry.target.id
  //         );
  //         if (index !== -1) {
  //           controls[index].start({
  //             opacity: 1,
  //             y: 0,
  //             transition: { duration: 0.6 },
  //           });
  //         }
  //       } else {
  //         const index = whyWizeLinks.findIndex(
  //           (link) => link.id === entry.target.id
  //         );
  //         if (index !== -1) {
  //           controls[index].start({
  //             opacity: 0,
  //             y: 40,
  //             transition: { duration: 0.33 },
  //           });
  //         }
  //       }
  //     });
  //   },
  //   {
  //     root: null, // viewport
  //     rootMargin: "0px",
  //     threshold: 0.33, // trigger when 33% of the section is visible
  //   }
  // );

  // sectionsRef.current.forEach((section) => {
  //   if (section) observer.observe(section);
  // });

  // return () => {
  //   const currentSections = sectionsRef.current; // Store the ref in a variable during cleanup
  //   currentSections.forEach((section) => {
  //     if (section) observer.unobserve(section);
  //   });
  // };
  // }, [controls]);

  return (
    <div className="flex flex-col items-center mb-4">
      <div className="max-w-[1300px] h-[100px] flex justify-center items-center w-full gap-4 mb-8">
        <div className="h-1 bg-black w-full max-w-[150px] sm:max-w-[200px] md:max-w-[33%] bg-gradient-to-r from-white to-primary"></div>
        <div className="w-full text-3xl md:text-4xl font-medium text-center">
          Why Choose&nbsp;<span className="text-primary">wiZ</span>e
        </div>
        <div className="h-1 bg-black w-full max-w-[150px] sm:max-w-[200px] md:max-w-[33%] bg-gradient-to-r from-primary to-white"></div>
      </div>
      <div className="flex w-full max-w-[1350px] relative">
        <div className="hidden md:flex flex-col w-full max-w-[300px] pt-[100px] sticky top-0 h-screen  px-8 text-lg font-medium tracking-wide gap-3">
          {whyWizeLinks.map((item) => (
            <WizeCampLink
              key={item.id}
              active={active}
              setActive={setActive}
              id={item.id}
              text={item.text}
            />
          ))}
        </div>
        <div className="md:border-l-2 md:border-[#8252ff] lg:px-[60px] xl:px-[100px] relative">
          <div
            id="allroundguidance"
            className="pb-[50px] sm:pb-[100px] sm:min-h-[700px] px-4"
          >
            <h4 className="pt-4 font-semibold text-primary">
              ALL ROUND GUIDANCE
              <div className="bg-primary w-6 h-6 blur-sm rounded-full absolute left-0 md:top-0 translate-x-[-14px] translate-y-[-100%] md:translate-y-[-50%]"></div>
            </h4>
            <div className="text-2xl md:text-3xl font-medium mt-8 mb-4">
              To make it happen for you
            </div>
            <p className="text-sm md:text-base text-muted-foreground font-medium my-4">
              Everything you need, we&apos;ve got it! From accessing thousands of
              opportunities with just one application and assessment to
              preparing for your next big break using our AI tools — and it all
              happens quickly and seamlessly.
            </p>
            <div className="bg-[#3a3a3a] aspect-[16/9] w-full my-8 rounded-2xl"></div>
          </div>

          <div id="pathtosuccess" className="pb-[100px] min-h-screen px-4">
            <PracticeCoding />
          </div>

          <div
            id="smartestplatform"
            className="pb-[50px] sm:pb-[100px] sm:min-h-[700px] px-4"
          >
            <h4 className="pt-4 font-semibold text-primary">
              SMARTEST PLATFORM
              <div className="bg-primary w-6 h-6 blur-sm rounded-full absolute left-0 translate-x-[-14px] translate-y-[-100%]"></div>
            </h4>
            <div className="text-2xl sm:text-3xl font-medium mt-8 mb-4">
              Convenient, Comfortable, and Seamless
            </div>
            <p className="text-sm sm:text-base text-muted-foreground font-medium my-4">
              Designed for a seamless experience, Wize lets you create your
              profile, attempt AI-powered interviews, practice for upcoming
              opportunities, and even get paid directly on the platform for
              matched opportunities — all from the comfort of your home.
            </p>
            <div className="bg-[#3a3a3a] aspect-[16/9] w-full my-8 rounded-2xl"></div>
          </div>

          <div id="expertsinsights" className="pb-[100px] min-h-screen">
            <ExperiencedCounsellors />
          </div>

          {/* <div className="sm:min-h-[700px] px-6">
            <h4 className="pt-4 font-semibold text-primary">
              ADVANCED FEATURES
              <div className="bg-primary w-6 h-6 blur-sm rounded-full absolute left-0 translate-x-[-14px] translate-y-[-100%] "></div>
            </h4>
            <div className="text-2xl sm:text-3xl font-medium mt-8 mb-4">
              Important features that&#39;ll sometimes be your buddy, sometimes
              your saviour
            </div>
            <p className="text-sm sm:text-base text-[#000000BB] font-medium my-4">
              Whether it&#39;s an AI-powered smart community that helps you
              learn and grow with peers in a unique and engaging way, or
              assessments that aid in self-evaluation, these features will cover
              all the gaps in your career journey, making your college and
              career path smooth.
            </p>
            <div className="flex flex-wrap justify-center gap-4 gap-y-5 min-h-[400px] w-full my-8 rounded-2xl">
              <div className="bg-white w-full max-w-[300px] lg:max-w-[380px] overflow-hidden rounded-2xl shadow-lg shadow-[#8C52FF30] h-[200px]">
                <Image
                  src="./home/whywize/4.svg"
                  alt="winningrecord"
                  width={100}
                  height={100}
                  className="w-full"
                />
              </div>
              <div className="bg-white w-full max-w-[300px] lg:max-w-[380px] overflow-hidden rounded-2xl shadow-lg shadow-[#8C52FF30] h-[200px]">
                <Image
                  src="./home/whywize/2.svg"
                  alt="winningrecord"
                  width={100}
                  height={100}
                  className="w-full"
                />
              </div>
              <div className="bg-white w-full max-w-[300px] lg:max-w-[380px] overflow-hidden rounded-2xl shadow-lg shadow-[#8C52FF30] h-[200px]">
                <Image
                  src="./home/whywize/3.svg"
                  alt="winningrecord"
                  width={100}
                  height={100}
                  className="w-full"
                />
              </div>
              <div className="bg-white w-full max-w-[300px] lg:max-w-[380px] overflow-hidden rounded-2xl shadow-lg shadow-[#8C52FF30] h-[200px]">
                <Image
                  src="./home/whywize/1.svg"
                  alt="winningrecord"
                  width={100}
                  height={100}
                  className="w-full"
                />
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
