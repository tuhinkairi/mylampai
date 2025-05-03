"use client"
import { CheckCircle2, User2Icon } from 'lucide-react'
import React from 'react'

function Favourites({favouriteTalents}:any) {
    // console.log("favourites in fav:: ",favouriteTalents)
  return (
    <div className='p-10'>
        <h1 className='font-bold text-2xl p-3 '>Your Favourite talents</h1>
        {favouriteTalents.length>0?favouriteTalents.map((talent:any,index:any)=>(
            <div key={index} className="text-md w-fit flex gap-2 p-3 mb-3 rounded-lg items-center border-2 border-blue-500"><User2Icon />{talent.user.name} 
            <CheckCircle2 className="text-purple-500" />
          </div>
        )):<h2>No Favourite talents found</h2>}
    </div>
  )
}

export default Favourites