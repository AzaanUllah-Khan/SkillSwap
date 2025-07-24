import { Routes, Route } from 'react-router-dom'
import Navbar from "./Components/Navbar"
import Signup from './Pages/Signup'
import Login from './Pages/Login'
import AddSkill from './Pages/AddSkill'
import NotFound from './Pages/NotFound'
import Profile from './Pages/Profile'
import SeeProfile from './Pages/SeeProfile'
import Home from './Pages/Home'
import Course from './Pages/Course'
const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/addskill" element={<AddSkill />}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/profile" element={<Profile />}/>
        <Route path="/course/:id" element={<Course />}/>
        <Route path="/seeprofile/:id" element={<SeeProfile/>}/>
        <Route path="*" element={<NotFound />}/>
      </Routes>
    </div>
  )
}

export default App
