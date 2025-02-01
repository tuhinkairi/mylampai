"use client"
import { useEffect, ReactNode } from "react"; // Import ReactNode from react
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";    
import AboutWize from "@/components/home/AboutWize";
import WhyWize from "@/components/home/WhyWize";
import BackedByBest from "@/components/home/BackedByBest";
import PowerOfWize from "@/components/home/PowerOfWize";
import CommunitySection from "@/components/home/Community";
import BottomNavBar from "@/components/home/BottomNavBar"
import './home.css';
import HeroSectionRecruiter from "@/components/home/HeroSectionRecruiter";

// Define the type for the children prop
interface SectionWrapperProps {
  children: ReactNode;
}

const SectionWrapper = ({ children }: SectionWrapperProps) => {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    triggerOnce: false, // This makes the animation trigger every time
    threshold: 0.1, // Adjust this to control when the animation triggers
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      }}
    >
      {children}
    </motion.div>
  );
};

export default function RecruiterPage() {
  useEffect(() => {
    document.title = "MyLampAi - Recruiter";
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <main className="home-page h-full bg-[#fff]">
        <SectionWrapper><HeroSectionRecruiter /></SectionWrapper>
        <SectionWrapper><AboutWize /></SectionWrapper>
        <WhyWize />
        <SectionWrapper><BackedByBest /></SectionWrapper>
        <SectionWrapper><PowerOfWize /></SectionWrapper>
        <SectionWrapper><CommunitySection /></SectionWrapper> 
      </main>
    </>
  );
}
