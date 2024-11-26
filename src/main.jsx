import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Signup from './pages/Signup.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Signup />
    {/* <App /> */}

  </StrictMode>,
)
