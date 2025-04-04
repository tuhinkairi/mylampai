import { Edit } from 'lucide-react'
import React from 'react'

function JoblistingRight() {
    let arr = [1, 2, 2, 2, 2, 2];

    return (
        <div className='overflow-hidden grid gap-5 text-sm pr-5 pb-32'>
            {Array.from(arr).map((element, index) => {
                return (
                    <>
                        <div className='joblisting overflow-y-auto p-5 border shadow-sm rounded-md flex items-center justify-around '>
                            <div className='grid gap-2'>
                                <h1 className='font-semibold text-lg  '>Title</h1>
                                <p className='description'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias ratione quia iusto nisi libero hic aliquam quas rem. Nulla vero omnis eos iste? Quam, est? Velit minima quam quidem quo.</p>
                                <div className='meta-data flex gap-x-6 gap-y-4'>
                                    <h1><span className='font-semibold '>heading : </span>Lorem, ipsum.</h1>
                                    <h1><span className='font-semibold '>heading : </span>Lorem, ipsum.</h1>
                                    <h1><span className='font-semibold '>heading : </span>Lorem, ipsum.</h1>
                                </div>
                                <div className='tags'>
                                    <span className='px-3 py-2 border rounded-md shadow-sm inline-block mr-2'>tags</span>
                                    <span className='px-3 py-2 border rounded-md shadow-sm inline-block mr-2'>tags</span>
                                    <span className='px-3 py-2 border rounded-md shadow-sm inline-block mr-2'>tags</span>
                                    <span className='px-3 py-2 border rounded-md shadow-sm inline-block mr-2'>tags</span>
                                </div>

                            </div>
                            <div className='space-x-4 flex justify-end'>
                                <button className='border shadow-sm p-2 px-4 rounded-md flex gap-3 items-center hover:shadow-md'><Edit className='w-4 h-4 ' /> Edit</button>

                            </div>
                        </div>
                    </>
                );
            })}



        </div>
    );
}

export default JoblistingRight;