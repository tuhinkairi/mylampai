"use client"
import React, { DOMElement, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  MapPinIcon,
  DollarSignIcon,
  ClockIcon,
  BriefcaseIcon,
  User2Icon,
  MoreVertical,
  MapPin,
  Check,
  Square,
  BarChart,
  Gem,
  GraduationCap,
  FileCheck,
  ScrollText,
  TicketCheck,
  CameraIcon,
  Video,
  Share,
  Heart,
  ArrowDownNarrowWideIcon,
  ArrowDown,
  ChevronDown,
  Share2,
  HeartOff,
} from "lucide-react";
import { addTalentToFavourites, sendOfferToTalents, getFavouriteTalents, removeTalentFromFavourites, revokeOfferFromTalents } from '@/actions/talentPoolActions';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import * as Flags from 'country-flag-icons/react/3x2';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '../ui/navigation-menu';
import Link from 'next/link';
import { ScrollArea } from '../ui/scroll-area';
import { motion, sync } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';


interface Profile {
  id: string;
  skills: string[];
  profile: string[];
  expectedSalary: number;
  locationPref: string;
  experienceYears: number;
  availability: string;
  createdAt: string;
}

interface Project {
  title: string;
  role: string;
  url: string;
  description: string;
  skills: string[];
}

const sections = [
  { id: 'insights', label: 'Insights', icon: <BarChart size={20} className='mr-0.5' /> },
  { id: 'intervies', label: 'Interviews', icon: <Video size={20} className='mr-0.5' /> },
  { id: 'education', label: 'Education', icon: <GraduationCap size={20} className='mr-0.5' /> },
  { id: 'skills', label: 'Skills', icon: <Gem size={20} className='mr-0.5' /> },
  { id: 'experiences', label: 'Experiences', icon: <TicketCheck size={20} className='mr-0.5' /> },
  { id: 'projects', label: 'Projects', icon: <ScrollText size={20} className='mr-0.5' /> },
];

interface ProfilePageProps {
  name: string;
  title: string;
  verified: boolean;
  location: string;
  country: string;
  affiliations: Array<{
    name: string;
    logo: string;
  }>;
  rates: {
    fullTime: number;
    partTime: number;
  };
}

const testData = {
  name: "Arpit Raj Gupta",
  title: "BTech Student-4th Year",
  verified: true,
  location: "Kharagpur, India",
  country: "IN",
  affiliations: [
    { name: "wIZe(myLamp AI)", logo: "Logo" },
    { name: "Indian Institute of Technology (IIT), Kharagpur", logo: "Logo" }
  ],
  rates: {
    fullTime: 12.87,
    partTime: 12.87
  }
}

const TagList = ({ title, items }: { title: string; items: string[] }) => (
  <div className="mt-4">
    {title && <h3 className="font-semibold">{title}</h3>}
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Badge key={index} variant="secondary">
          {item}
        </Badge>
      ))}
    </div>
  </div>
);

function DetailedProfile({ profile, talentPoolId }: any) {
  // console.log("profile:: ", profile,)

  const [activeSection, setActiveSection] = useState('insights');
  const [manualOverride, setManualOverride] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const overrideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [headerHeight, setHeaderHeight] = useState(150);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [layout, setLayout] = useState<"column" | "row">("column");
  const [isFavourite, setIsFavourite] = useState(false);
  const [isTalentMatched, setIsTalentMatched] = useState<boolean>(false)

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop > 30) {
        setHeaderHeight(100);
        setLayout("row")
      } else {
        setHeaderHeight(150);
        setLayout("column")
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);
  // Intersection Observer that updates activeSection only when not in manual override mode.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!manualOverride && entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) observer.unobserve(element);
      });
      observer.disconnect();
    };
  }, [manualOverride]);

  // Handle click on a tab
  interface HandleClickEvent extends React.MouseEvent<HTMLAnchorElement> { }

  const handleClick = (e: HandleClickEvent, sectionId: string) => {
    e.preventDefault();
    setManualOverride(true);
    if (overrideTimeoutRef.current) clearTimeout(overrideTimeoutRef.current);

    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(sectionId);

    overrideTimeoutRef.current = setTimeout(() => {
      setManualOverride(false);
    }, 2000);
  };

  const handleOffer = async (userId: string) => {
    if (!isTalentMatched) {
      try {
        const res = await sendOfferToTalents({
          talentPoolId: talentPoolId,
          talentIds: [userId],
        });
        if (res.status === "success") {
          setIsTalentMatched(true)
          toast.success(res.message);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        const res = await revokeOfferFromTalents(
          {
            talentPoolId: talentPoolId,
            talentIds: [userId],
          }
        );
        if (res.status === "success") {
          setIsTalentMatched(false)
          toast.success(res.message);
        }
      } catch (error) {
        console.error(error);
      }
    }

  }

  const CountryFlag = () => {
    if (!testData.country) return null;
    const FlagComponent = Flags[testData.country as keyof typeof Flags];
    return FlagComponent ? <FlagComponent className="w-5 h-5 ml-2" /> : null;
  };

  useEffect(() => {
    const checkIfFavourite = async () => {
      try {
        const favourites = await getFavouriteTalents(talentPoolId);
        setIsFavourite(favourites.data.some(fav => fav.id === profile.id));
      } catch (error) {
        console.error("Error checking favourites:", error);
      }
    };
    const checkIsTalentMatched = async () => {
      try {
        setIsTalentMatched(profile.talentMatch.some((item: { talentPoolId: string }) => item.talentPoolId === talentPoolId))
      } catch (error) {
        console.error("Error checking isTalentMatched:", error);
      }
    }
    checkIfFavourite();
    checkIsTalentMatched();
  }, [talentPoolId, profile.id]);

  const handleFavourite = async () => {
    if (isFavourite) {
      await removeTalentFromFavourites(talentPoolId, profile.id);
      setIsFavourite(false);
    } else {
      await addTalentToFavourites(talentPoolId, profile.id);
      setIsFavourite(true);
    }
  };

  return (
    <div ref={containerRef} className="h-screen relative overflow-auto p-1 bg-gray-100 rounded-lg shadow-md">
      {/* Header Section */}
      <motion.div
        style={{
          height: headerHeight,
          transition: "height 0.3s ease",
        }}
        className="relative bg-[url(/images/background.jpg)] rounded-t-md w-full"
      >
        {/* Inner container animated with layout change */}
        <motion.div
          layout
          transition={{ duration: 0.3 }}
          style={{
            display: "flex",
            flexDirection: layout, // toggles between "column" and "row-reverse"
            alignItems: "flex-end",
          }}
          className="absolute gap-4 top-6 right-5"
        >
          <motion.div layout>
            <DropdownMenu>
              <DropdownMenuTrigger><div className='flex gap-1 justify-center items-center p-2 bg-purple-500 rounded-md text-white ' >Options <ChevronDown /> </div> </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem><Button size='sm' variant="outline" onClick={() => handleOffer(profile.id)} > {isTalentMatched ? "Revoke Offer" : "Extend Offer"}</Button></DropdownMenuItem>
                <DropdownMenuItem><Button size='sm' variant="outline">Add Interview</Button></DropdownMenuItem>
                <DropdownMenuItem><Button size='sm' variant="outline">Message</Button></DropdownMenuItem>
                <DropdownMenuItem><Button size='sm' variant="outline">Add Note</Button></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
          <motion.div layout className="flex gap-2 mt-2">
            <Button type="button" size="sm" onClick={handleFavourite}>
              {isFavourite ? <HeartOff /> : <Heart />}
            </Button>
            <Button type="button" size="sm">
              <Share2 />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
      {/* Profile card */}
      <div className="relative mt-2 bg-white rounded-lg shadow-md p-2">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-shrink-0">
            <Image alt="profile" className='rounded-md' src={profile.user.image} width={60} height={40} />
          </div>
          {/* Profile info */}
          <div className="flex-grow flex flex-col md:flex-row justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-md font-semibold text-gray-700">{profile.user.name}</h2>
                {testData.verified && (
                  <span className="flex items-center justify-center w-4 h-4 bg-violet-500 rounded-full">
                    <Check className="w-2 h-2 text-white" />
                  </span>
                )}
                <span className="text-gray-500 text-sm">({testData.title})</span>
              </div>

              <div className="mt-4">
                {testData.affiliations.map((affiliation, idx) => (
                  <div key={idx} className="flex items-center mt-1">
                    <span className="text-blue-500 font-medium mr-1"><Square /></span>
                    <span className="text-gray-600">{affiliation.name}</span>
                  </div>
                ))}

                <div className="flex items-center mt-2 text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{testData.location}</span>
                  <CountryFlag />
                </div>
              </div>
            </div>

            {/* Rates */}
            <div className="mt-4 md:mt-0 md:text-right">
              <div className="mb-4">
                <div className="text-gray-700 font-medium">Full-time at ${testData.rates.fullTime} / month</div>
                <div className="text-gray-500 text-sm">Starts immediately</div>
              </div>
              <div>
                <div className="text-gray-700 font-medium">Part-time at ${testData.rates.partTime} / month</div>
                <div className="text-gray-500 text-sm">Starts immediately</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className='mt-4'>
        <div className='flex overflow-x-auto'>
          <NavigationMenu>
            <NavigationMenuList >
              {sections.map((section) => (
                <NavigationMenuItem key={section.id} >
                  <NavigationMenuLink
                    className={`flex items-center mx-1 p-1 rounded-md transition-colors cursor-pointer ${activeSection === section.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={(e) => handleClick(e, section.id)}
                  >
                    {section.icon}
                    {section.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <ScrollArea ref={scrollContainerRef} id="scrollArea" className='h-[calc(100vh-96px)] scroll-smooth mt-2 overflow-auto bg-white rounded-lg shadow-md p-2'>
          <section id='insights' className='h-[20rem] mb-3 bg-blue-100'>
            <h1 className='p-4 text-xl font-bold'>Insights</h1>
            <div className='p-4 pt-0'>
              {
                profile.profiles.length > 0 && <TagList title="Profiles" items={profile.profiles} />
              }
              {
                profile.bio?.length > 0 && (
                  <>
                    <h3 className="font-semibold mt-2">Bio</h3>
                    <p className='text-justify'>{profile.bio}</p>
                  </>
                )
              }

            </div>
          </section>
          <section id='interviews' className='h-[20rem] mb-3 bg-indigo-100'>
            <h1 className='p-4 text-xl font-bold'>Interviews</h1>
          </section>
          <section id='education' className='mb-3 p-4'>
            <h1 className='p-4 text-xl font-bold'>Education</h1>
            <div>
              {
                profile.education?.map((edu: any, index: any) => (
                  <div key={index} className="relative border rounded-lg p-4 mb-4">
                    <div className='flex gap-2'>
                      <Image src={'/images/edu_logo.jpeg'} alt="edu_logo" width={40} height={40} className='rounded-md' />
                      <h3 className="font-semibold text-lg">{edu.school}</h3>
                    </div>
                    <p className="text-muted-foreground">
                      <span className="">{edu.degree}</span>
                      &nbsp;-&nbsp;
                      <span>{edu.field}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground text-sm">
                        {edu?.startDate?.toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      &nbsp;-&nbsp;
                      <span className="text-muted-foreground text-sm">
                        {edu?.endDate?.toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                    <p className="text-muted-foreground">{edu?.description}</p>
                    {edu?.skills.length > 0 && (
                      <TagList title="Skills" items={edu.skills} />
                    )}
                  </div>
                ))
              }
            </div>
          </section>
          <section id='skills' className='mb-3 bg-purple-100'>
            <h1 className='p-4 text-xl font-bold'>Skills</h1>
            <div className='pl-4 pb-5'>
              {profile?.skills && profile?.profiles && (profile?.skills?.length > 0 || profile?.profiles?.length > 0) && (
                <>
                  <TagList title="" items={profile.skills} />
                  {/* <TagList title="Profiles" items={profile.profiles} /> */}
                </>
              )}
            </div>
          </section>
          <section id='experiences' className='mb-3 bg-yellow-100'>
            <h1 className='p-4 text-xl font-bold'>Experience</h1>
            <div>
              {
                profile.experience?.map((exp: any, index: any) => (
                  <div key={index} className="relative border rounded-lg p-4">
                    <div className='flex gap-2'>
                      <Image src={'/images/org_logo.png'} alt="edu_logo" width={40} height={40} className='rounded-md' />
                      <h3 className="font-semibold text-lg">{exp.company}</h3>
                    </div>
                    <div className="text-muted-foreground ml-12">
                      <p className="">{exp.position}</p>
                      <p>{exp.location}</p>
                      <span className="text-muted-foreground text-sm">
                        {exp?.startDate?.toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        &nbsp;-&nbsp;
                        {exp?.endDate?.toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <ul className='ml-12 list-disc'>
                      {exp.description.split(/(?:•|\.\s)/).map((item: string) => item.trim().replace(/^[\-\•\*\•]+/, '')).filter((item: string) => item.length > 0).map((item: string, index: number) => (<li key={index}> {item.endsWith('.') ? item : item + '.'}</li>))}</ul>
                    {exp?.skills.length > 0 && (
                      <TagList title="Skills" items={exp.skills} />
                    )}
                  </div>
                ))
              }
            </div>
          </section>
          <section id='projects' className=' mb-3 bg-green-50'>
            <h1 className='p-4 text-xl font-bold'>Projects</h1>
            {profile.projects.length > 0 ? (
              profile.projects.map((item: Project, index: number) => (
                <div key={index} className="relative border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-muted-foreground">{item?.role}</p>
                  <a href={item?.url} className="text-muted-foreground">{item?.url}</a>
                  <p className="text-muted-foreground">{item.description}</p>

                  {item.skills.length > 0 && (
                    <TagList title="Skills" items={item.skills} />
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-6 ">
                <span>No Projects to display</span>
              </div>
            )}
          </section>
        </ScrollArea>
      </div>
    </div>
  )
}

export default DetailedProfile