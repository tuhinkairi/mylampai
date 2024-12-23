"use client";
import Image from "next/image";
import {
  Carousel,
  CarouselItem,
  CarouselContent,
} from "@/components/ui/carousel";

import AutoPlay from "embla-carousel-autoplay";
import { Quote, Star } from "lucide-react";
interface CounsellorCardProps {
  name: string;
  image: string;
  experience: string;
  ranking: string;
}

const carouselData = [
  {
    name: "Fiona ",
    image: "/home/profile.jpg",
    experience:
      "I landed my dream job as a graphic designer through this platform! The personalized job matches and seamless application process made everything effortless. Employers truly recognized my talents, and within weeks, I received multiple offers. I'm grateful for the boost in confidence and the career breakthrough!",
    ranking: "Lead Counsellor",
  },
  {
    name: "Claudia",
    image: "/home/profile.jpg",
    experience:
      "This platform connected me with my current employer in record time. Its talent assessment tools showcased my skills perfectly. The user-friendly interface and detailed job postings made it easy to apply. Thanks to this platform, I’m now thriving in a role that fits my passion and expertise.",
    ranking: "Lead Counsellor",
  },
  {
    name: "Miachel",
    image: "/home/profile.jpg",
    experience:
      "As a software developer, I struggled to find roles that suited my niche. This platform's tailored recommendations were a game-changer. I secured a position at a top company that values my skills. It’s the best resource for showcasing your talents and standing out in today’s competitive job market",
    ranking: "Lead Counsellor",
  },
  {
    name: "Liam",
    image: "/home/profile.jpg",
    experience:
      "I always doubted online job platforms until I tried this one. Its unique approach to highlighting my creative writing skills caught the attention of my current employer. The whole process was smooth, and now I have a fulfilling job where my talents truly shine. Highly recommended!",
    ranking: "Lead Counsellor",
  },
  {
    name: "Olivia",
    image: "/home/profile.jpg",
    experience:
      "Through this platform, I transformed my freelance photography passion into a full-time career. The talent profile builder was incredibly insightful, helping me land a job with a prestigious media house. I couldn’t have asked for a better platform to kickstart my professional journey!",
    ranking: "Lead Counsellor",
  },
];

const CounsellorCard: React.FC<CounsellorCardProps> = ({
  name,
  image,
  experience,
  ranking,
}) => {
  return (
    <div className="w-full max-w-[260px] flex flex-col items-center bg-white rounded-lg overflow-hidden shadow-lg">
      <div className="w-full h-14 bg-primary relative flex items-center justify-center">
        <div className="flex items-end gap-2 absolute bottom-0 translate-y-1/2 left-0 px-4 right-0">
          <Image
            src={image}
            alt="profile"
            width={200}
            height={200}
            className=" h-14 w-14 rounded-lg object-cover border-2 border-primary"
          />
          <div className="flex items-center gap-2 justify-between w-full">
            <div className="font-medium">{name}</div>
            <Star className="w-3 h-3 text-primary" />
          </div>
        </div>
      </div>
      <div className="mt-14 pb-8 flex gap-2 flex-col items-center relative">
        <div className="text-xs px-4 text-muted-foreground line-clamp-4 ">
          {experience}
        </div>
        <Quote className="w-5 h-5 text-primary absolute right-2 bottom-2" />
      </div>
    </div>
  );
};

interface BulletCardProps {
  title: string;
  description: string;
}

const BulletCard: React.FC<BulletCardProps> = ({ title, description }) => {
  return (
    <div className="w-full max-w-[360px] flex p-4 gap-4 items-center bg-white rounded-xl overflow-hidden shadow-lg">
      <div className="bg-[#2E66D3] w-6 h-6 rounded-full backdrop-blur-sm"></div>
      <div>
        <div className="text-xl font-semibold">{title}</div>
        <div className="text-[#000000BB] font-medium text-sm">
          {description}
        </div>
      </div>
    </div>
  );
};

const ExperiencedCounsellors: React.FC = () => {
  return (
    <>
      <h4 className="pt-4 font-semibold text-primary px-4">
        EXPERTS INSIGHTS
        <div className="bg-primary w-6 h-6 blur-sm rounded-full absolute left-0 translate-x-[-14px] translate-y-[-100%] "></div>
      </h4>
      <div className="text-3xl font-medium mt-8 mb-4 px-6">
        Loved by Talents and Recruiters Alike
      </div>
      <p className="text-muted-foreground font-medium my-4 px-6">
        Thousands of talented individuals use Wize and rave about the
        experience. At the same time, recruiters prefer our innovative platform
        for hiring. Check out some of the inspiring success stories from our
        community!
      </p>
      <div className="w-full my-8 rounded-2xl">
        <Carousel
          plugins={[
            AutoPlay({
              delay: 2000,
              stopOnFocusIn: true,
              stopOnMouseEnter: true,
              stopOnInteraction: false,
            }),
          ]}
        >
          <CarouselContent className="px-4 pb-8">
            {carouselData.map((item, index) => (
              <CarouselItem key={index} className=" sm:basis-1/3 xl:basis-1/4">
                <CounsellorCard
                  name={item.name}
                  image={item.image}
                  experience={item.experience}
                  ranking={item.ranking}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="flex flex-wrap gap-4 justify-evenly bg-primary-foreground w-full py-8 px-4 rounded-lg shadow-lg">
          <BulletCard title="10k+" description="Successful Premium Admits" />
          <BulletCard title="10k+" description="Successful Premium Admits" />
          <BulletCard title="10k+" description="Successful Premium Admits" />
          <BulletCard title="10k+" description="Successful Premium Admits" />
        </div>
      </div>
    </>
  );
};

export default ExperiencedCounsellors;
