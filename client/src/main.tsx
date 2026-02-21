import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Header from '../src/components/header'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className='w-auto h-auto font-inter'>
      <Header></Header>
    </div>
   
  </StrictMode>,
)
