"use client"
import React from 'react';
import Image from 'next/image';
import useStore from '../left/zustandleft/storeleft';
import { useEffect } from 'react';
import { useState } from 'react';
// import { motion } from 'framer-motion';
import useStoreright from '../right/zustandright/storeright';
const Middle: React.FC = () => {
  const {isOpen, toggleOpen } = useStore();
  const { isOpenright, toggleOpenright } = useStoreright();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const checkScreenSize = () => {
    setIsSmallScreen(window.innerWidth < 1020);
  };
  useEffect(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const handleToggle = () => {
   if(isOpenright==true){
    toggleOpenright();
  };
   }
   const toggleButton = () => {
    if (isSmallScreen && isOpen) {
      toggleOpen();
    }
  };
  

  
  return (
    <div onClick={toggleButton} className="relative w-full flex h-full justify-center">
      <div className="absolute flex  h-14 w-full shadow-md ">
        <div className="absolute top-0 right-12 pt-4 pr-3 pb-0 pl-4">
          <Image src="/Group.png" alt="Logo" width={15} height={15} priority />
        </div>
        <div className="relative grid gap-2 grid-cols-4 -mt-1  cursor-pointer">
          <div onClick={()=>{
            handleToggle();
            toggleOpen();
          }} className="my-auto mx-6 w-fit h-fit  ">
            <Image
              src="/modules/Group 22.svg"
              alt="Logo"
              className="w-10 h-12"
              width={23}
              height={28}
              priority
            />
          </div>
          <div
           onClick={handleToggle}
            className="font-semibold w-fit text-lg my-4 -mx-6 cursor-pointer"
          >
            Course
          </div>
          <div className="text-center w-4 my-5 -mx-6">
            <Image
              src="/Vector (1).svg"
              alt="Logo"
              width={10}
              height={10}
              priority
            />
          </div>
          <div className="text-left sm:absolute sm:left-56 left-48 absolute font-semibold my-4 text-lg">
            Tech 01
          </div>
        </div>
      </div>

      <div className="flex-grow flex max-w-4xl  justify-center items-center  h-[70%] my-auto  mx-9">
        
          
            <iframe
              className="w-full h-full m-auto rounded-md"
              src="https://www.youtube.com/embed/1MTyCvS05V4?si=E9-w5fizcHwuPGaV"
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
        

      </div>

      <div className="absolute bottom-1 flex border-[0.5px] border-t-[#828282] h-14 w-full justify-between ">
        <div className="mx-7 h-7 my-auto">
          <Image
            src="/modules/previous.svg"
            alt="Previous"
            className="w-full h-full my-auto"
            width={30}
            height={30}
            priority
          />
        </div>
        <div className="mx-7 h-7 my-auto">
          <Image
            src="/modules/next.svg"
            alt="Next"
            className="w-full h-full my-auto"
            width={30}
            height={30}
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default Middle;
