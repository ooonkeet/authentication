import React from 'react'
import { AppData } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate=useNavigate()
  const {logoutUser} = AppData()
  return (
    <div className="flex w-[100px] m-auto mt-40">
      <button className="bg-red-500 text-white p-2 rounded-md" onClick={()=>logoutUser(navigate)}>Logout</button>
    </div>
  )
}

export default Home