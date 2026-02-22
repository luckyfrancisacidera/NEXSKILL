import { Routes, Route } from 'react-router-dom';
import HRLayout from './layouts/HRLayout';
export default function AppRouter() {
    return (
        <Routes>
            <Route path='/admin' element={<HRLayout/>}></Route>
        </Routes>
    );
}