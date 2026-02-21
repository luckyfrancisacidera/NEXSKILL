import {Funnel} from 'lucide-react'
export default function Searchbar(){
     return(
        <div className="w-full h-full max-w-120 bg-transparent rounded-xl flex flex-for items-center border px-3
        ">

            <input className="w-full h-auto bg-primary-dark border-0" type="text" placeholder='Search candidate' />
            <Funnel></Funnel>
        </div>
     )
}