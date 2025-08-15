import React from 'react'
import { BrowserRouter , Route , Routes , Navigate } from 'react-router-dom'
import Login from '../src/components/Login'
import Register from '../src/components/Register'
import Home from '../src/components/Home'
import User from '../src/components/User'
import ProtectedRoute from '../src/components/ProtectedRoute'
import NotFound from '../src/components/NotFound'
import LandingPage from '../src/components/LandingPage'
import PostManager from '../src/components/PostManager'
import PostFeed from '../src/components/PostFeed'
import { ThemeProvider } from '../src/contexts/ThemeContext'

const App = () => {
  
function Logout(){
  localStorage.clear()
  return <Navigate to="/login" />
}
function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

  return (
   <ThemeProvider>
     <BrowserRouter>
       <Routes>
         <Route path='/logout' element={<Logout />} />
         <Route path='/home' element={<ProtectedRoute> <Home/> </ProtectedRoute>} />
         <Route path='/dashboard' element={<ProtectedRoute> <User/> </ProtectedRoute>} />
         <Route path='/posts' element={<ProtectedRoute> <PostManager/> </ProtectedRoute>} />
         <Route path='/feed' element={<ProtectedRoute> <PostFeed/> </ProtectedRoute>} />
         <Route path='/login' element={<Login />} />
         <Route path='/Register' element={<RegisterAndLogout/>}/>
         <Route path='*' element={<NotFound/>} />
         <Route path="/" element={<LandingPage/>}/>
       </Routes>
     </BrowserRouter>
   </ThemeProvider>
  )
}

export default App
