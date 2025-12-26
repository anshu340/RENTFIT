import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './Pages/Landing'
import CreateAccount from './Pages/CreateAccount'
import Lcreateaccount from './Pages/Lcreateaccount'
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard '
import StoreRegister from './Pages/StoreRegister'
import UserRegister from './Pages/UserRegister'
import StoreLogin from './Pages/StoreLogin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/createAccount' element={<CreateAccount/>}/>
        <Route path='/lcreateaccount' element={<Lcreateaccount/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/storeRegister' element={<StoreRegister/>}/>
        <Route path='/userRegister' element={<UserRegister/>}/>
        <Route path='/storeLogin' element={<StoreLogin/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App