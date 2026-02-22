import Header from '../../shared/components/Header'
import CandidateSidebar from '../../features/candidates/components/CandidateSidebar'
import CandidateSummary from '../../features/candidates/components/CandidateSummary'
export default function HRLayout(){
    return(
        <>
            <Header></Header>
            <div className='grid grid-cols-[23%_77%] '>
              {/* Side bar */}
              <div className='bg-gray-100 w-full h-screen p-4'>
                <CandidateSidebar/> 
              </div>

              {/* Main Content */}
              <div className='w-full h-screen p-7'>
                <CandidateSummary></CandidateSummary>
              </div>
            
            </div>
        
        </>
    )
}