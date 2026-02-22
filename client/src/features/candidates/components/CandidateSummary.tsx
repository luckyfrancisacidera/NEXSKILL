import { useState } from "react"
import CandidateTable from "./CandidateTable"
const CandidateSummary : React.FC = () =>{
  const [applicantCount, setApplicantCount] = useState<number>(5)
  return(
    <div>
        <div className="flex flex-row gap-4 font-bold text-xl items-center">
            <p>Applicant</p>
            <div className="w-auto px-3 rounded-full h-full text-sm bg-gray-200 text-gray-500">{applicantCount}</div>
        </div>
        
        <div className="w-full h-auto  flex flex-row items-center">
          {/* New applicants Count */}
          <div className="flex justify-center items-start hover:bg-gray-200 ease-in cursor-pointer flex-col bg-gray-100  w-35 border-r border-gray-300 mt-5 px-4 py-2 gap-2 h-33">
            <p className="text-4xl font-normal  ">{applicantCount}</p>
            <p className="text-xl ">New Applicants</p>
          </div>
          {/*Interview Count */}
          <div className="flex justify-start items-start flex-col hover:bg-gray-200 ease-in cursor-pointer bg-gray-100  w-35 mt-5 px-4 py-4 gap-2 h-33">
            <p className="text-4xl font-normal  ">{applicantCount}</p>
            <p className="text-xl ">Interview</p>
          </div>
        </div>

        <div className="mt-10 ">
            <p className="mb-4">NEW APPLICANT</p>
            <CandidateTable></CandidateTable>
        </div>
    </div>
  )
}
export default CandidateSummary