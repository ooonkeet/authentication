import React from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import Home from './pages/Home'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify'
import VerifyOTP from './pages/VerifyOTP'
import { AppData } from './context/AppContext'
import Loading from './Loading'
const App = () => {
  const {isAuth,loading} = AppData()
  return <>
  {loading?(<Loading/>):(<BrowserRouter>
  <Routes>
    <Route path='/' element={isAuth?<Home/>:<Login/>}/>
    <Route path='/login' element={isAuth?<Home/>:<Login/>}/>
    <Route path='/verifyotp' element={isAuth?<Home/>:<VerifyOTP/>}/>
  </Routes>
  <ToastContainer/>
  </BrowserRouter>)}
  </>
}

export default App