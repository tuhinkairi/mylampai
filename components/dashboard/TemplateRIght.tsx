import React from 'react'
import { Button } from '../ui/button'

function TemplateRIght() {
  return (
    <div className='min-h-full min-w-full border-x '>
      {/* upper */}
      <div className='btn-secton p-5 '>
        <Button className='hover:bg-primary-dark'>
          Add Job
        </Button>
      </div>
      <div className='text-section px-3 space-y-3'>
        <div className='container-text p-3 rounded-md border text-sm shadow-sm bg-primary-foreground'>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fuga, inventore ducimus minus exercitationem eum quo omnis tenetur aliquam quam aut nobis ea distinctio error a, minima blanditiis maiores nesciunt est.
        </div>
        <div className='container-text p-3 rounded-md border text-sm shadow-sm bg-primary-foreground'>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fuga, inventore ducimus minus exercitationem eum quo omnis tenetur aliquam quam aut nobis ea distinctio error a, minima blanditiis maiores nesciunt est.
        </div>
        <div className='container-text p-3 rounded-md border text-sm shadow-sm bg-primary-foreground'>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fuga, inventore ducimus minus exercitationem eum quo omnis tenetur aliquam quam aut nobis ea distinctio error a, minima blanditiis maiores nesciunt est.
        </div>
      </div>
    </div>
  )
}

export default TemplateRIght
