import React from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import Home from './pages/Home'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify'
import VerifyOTP from './pages/VerifyOTP'
const App = () => {
  return <>
  <BrowserRouter>
  <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/login' element={<Login/>}/>
    <Route path='/verifyotp' element={<VerifyOTP/>}/>
  </Routes>
  <ToastContainer/>
  </BrowserRouter>
  </>
}

export default App