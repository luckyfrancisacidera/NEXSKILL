import Lightbrand_logo from '../assets/Lightbrand_logo.png'
import Darkbrand_logo from '../assets/Darkbrand_logo.png'
import { Button } from 'flowbite-react'
import Searchbar from './Searchbar'
import { TextAlignJustify,Bell } from 'lucide-react'

export default function Header() {
  return (
    <div className="flex flex-row justify-between items-center w-full h-auto bg-primary-dark text-primarty-light px-8 py-1 ">
      
      {/* Left Section */}
      <div className="flex flex-row justify-start items-center font-bold tracking-[0.18em] ">
        
        <div className='mr-5 min-w-15'>
          <img
            className="w-15 h-15"
            src={Lightbrand_logo}
            alt="Light.logo"
          />
          
        </div>

        <div className="md:flex hidden justify-end items-center w-auto">
          <ul className="flex flex-row gap-8  mr-7 p-2 w-full text-[0.85em]" >
            <li className='relative cursor-pointer before:content-[""] before:w-0 before:h-1
            before:bg-white  before:absolute before:-bottom-2 before:rounded-full before:left-0 
            hover:before:w-full before:transition-all before:ease-out'>Candidates</li>
            <li className='cursor-pointer before:content-[""] before:w-0 before:h-1 
            before:bg-white relative before:absolute before:rounded-full before:-bottom-2  before:left-0 
             hover:before:w-full before:transition-all before:ease-out '>Jobs</li>
            <li className='cursor-pointer before:content-[""] before:w-0 before:h-1 
            before:bg-white relative before:absolute before:-bottom-2 before:rounded-full before:left-0 
             hover:before:w-full before:transition-all before:ease-out '>Interviews</li>
            <li className='cursor-pointer before:content-[""] before:w-0 before:h-1 
             hover:before:w-full  before:bg-white relative before:absolute before:-bottom-2 before:rounded-full before:left-0 before:transition-all before:ease-out'>Visual Insights</li>
          </ul>
        </div>
       
      </div>

      {/* Right Section (Mobile Menu Icon) */}
      <div className="flex justify-end items-center md:hidden">
        <TextAlignJustify
          strokeWidth={2.25}
          className="cursor-pointer"
        />
      </div>

      {/* Search bar desktop size */}
      <div className='w-1/2 h-auto flex flex-row justify-end items-center gap-5'>
        <Searchbar></Searchbar>
        <Bell />
      </div>
      
    </div>
    
  )
}
