import { CheckCircle2, User2Icon } from 'lucide-react'
import React from 'react'

function Offers({ offersSent }: { offersSent: any }) {
    return (
        <div className='p-10'>
            <h1 className='font-bold text-2xl p-3 '>Talents with offers</h1>
            {offersSent.length>0?offersSent.map((offer: any, index: any) => (
                <div key={index} className="text-md w-fit flex gap-2 p-3 mb-3 rounded-lg items-center border-2 border-blue-500"><User2Icon />{offer.talent.user.name}
                    <CheckCircle2 className="text-purple-500" />
                </div>
            )):<h1>No Offers found</h1>}
        </div>
    )
}

export default Offers