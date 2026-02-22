import { Routes, Route } from 'react-router-dom';
import HRLayout from './layouts/HRLayout';
import CandidatePage from './layouts/CandidateLayout'
import JobpostingPage from './layouts/JobpostingLayout'
export default function AppRouter() {
    return (
        <Routes>
            <Route element={<HRLayout/>}>
               <Route path='/candidate' element={<CandidatePage/>}/>
                <Route path='/job' element={<JobpostingPage/>}/>
            </Route>
        </Routes>
    );
}