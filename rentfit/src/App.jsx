import { Routes, Route } from 'react-router-dom';
import Landing from './Pages/Landing.jsx';
import CreateAccount from './Pages/CreateAccount.jsx';
import Login from './Pages/Login.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import StoreRegister from './Pages/StoreRegister.jsx';
import UserRegister from './Pages/UserRegister.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/createAccount" element={<CreateAccount />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/storeRegister" element={<StoreRegister />} />
      <Route path="/userRegister" element={<UserRegister />} />
    </Routes>
  );
}

export default App;
