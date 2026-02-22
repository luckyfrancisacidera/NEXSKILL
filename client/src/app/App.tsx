import { BrowserRouter } from "react-router";
import AppRouter from '@app/routes/routes'
const App: React.FC = ()=>{
   return(
      <BrowserRouter>
        <AppRouter></AppRouter>
      </BrowserRouter>
   )
}

export default App;