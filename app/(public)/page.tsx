import { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
// import AboutWize from "@/components/home/AboutWize";
// import WizeCamp from "@/components/home/WizeCamp";
import WhyWize from "@/components/home/WhyWize";
import VideoComponent from "@/components/home/VideoComponent";
import BackedByBest from "@/components/home/BackedByBest";
import HowWizeWork from "@/components/home/HowWizeWork";
// import PowerOfWize from "@/components/home/PowerOfWize";
// import RecentAdvances from "@/components/home/RecentAdvances";
import CommunitySection from "@/components/home/Community";
// import HomeSlider from "@/components/home/HomeSlider";
import "./home.css";

// // Define the type for the children prop
// interface SectionWrapperProps {
//   children: ReactNode;
// }

// const SectionWrapper = ({ children }: SectionWrapperProps) => {
//   const controls = useAnimation();
//   const { ref, inView } = useInView({
//     triggerOnce: false,
//     threshold: 0.1,
//   });

//   useEffect(() => {
//     if (inView) {
//       controls.start("visible");
//     } else {
//       controls.start("hidden");
//     }
//   }, [controls, inView]);

//   return (
//     <motion.div
//       ref={ref}
//       initial="hidden"
//       animate={controls}
//       variants={{
//         hidden: { opacity: 0, y: 50 },
//         visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
//       }}
//     >
//       {children}
//     </motion.div>
//   );
// };

export const metadata: Metadata = {
  title: "wiZe (myLampAI) | Home",
  description:
    "wiZe is a career guidance platform that helps you find your dream career.",
};

export default function Page() {
  return (
    <>
      <main className="home-page h-full">
        {/* <SectionWrapper> */}
        <HeroSection />
        {/* </SectionWrapper> */}
        {/* <SectionWrapper> */}
        {/* <AboutWize /> */}
        {/* </SectionWrapper> */}
        {/* <SectionWrapper> */}
        {/* <WizeCamp /> */}
        {/* </SectionWrapper> */}
        {/* <SectionWrapper>
        </SectionWrapper> */}
        {/* <HomeSlider /> */}
        <VideoComponent />
        <HowWizeWork />
        <WhyWize />
        {/* <SectionWrapper> */}
        <BackedByBest />
        {/* </SectionWrapper> */}
        {/* <SectionWrapper> */}
        {/* <PowerOfWize /> */}
        {/* </SectionWrapper> */}
        {/* <SectionWrapper> */}
        {/* <RecentAdvances /> */}
        {/* </SectionWrapper> */}
        {/* <SectionWrapper> */}
        <CommunitySection />
        {/* </SectionWrapper> */}
      </main>
    </>
  );
}
