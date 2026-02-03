import { Routes, Route } from 'react-router-dom';
import Landing from './Pages/Landing.jsx';
import CreateAccount from './Pages/CreateAccount.jsx';
import Login from './Pages/Login.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import StoreRegister from './Pages/StoreRegister.jsx';
import UserRegister from './Pages/UserRegister.jsx';
import StoreDashboard from './Pages/StoreDashboard.jsx';
import DonateClothing from './Pages/DonateClothing.jsx';
import MyDonations from './Pages/MyDonations.jsx';
import StoreDonations from './Pages/StoreDonations.jsx';
import AddClothingItem from './Pages/AddClothingItem.jsx';
import MyClothingItems from './Pages/MyClothingItems.jsx';
import BrowseClothes from './Pages/BrowseClothes.jsx';
import Wishlist from './Pages/Wishlist.jsx';
import MyRentals from './Pages/MyRentals.jsx';
import StoreRentals from './Pages/StoreRentals.jsx';
import RentManagement from './Pages/RentManagement.jsx';
import AboutUs from './Pages/AboutUs.jsx';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/createAccount" element={<CreateAccount />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/storeRegister" element={<StoreRegister />} />
      <Route path="/userRegister" element={<UserRegister />} />
      <Route path="/storeDashboard" element={<StoreDashboard />} />
      <Route path="/donate" element={<DonateClothing />} />
      <Route path="/mydonations" element={<MyDonations />} />
      <Route path="/storedonations" element={<StoreDonations />} />
      <Route path="/addClothingItem" element={<AddClothingItem />} />
      <Route path="/myClothingItems" element={<MyClothingItems />} />
      <Route path="/browseClothes" element={<BrowseClothes />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/myrentals" element={<MyRentals />} />
      <Route path="/storerentals" element={<StoreRentals />} />
      <Route path="/rentmanagement" element={<RentManagement />} />
      <Route path="/about" element={<AboutUs />} />

    </Routes>
  );
}

export default App;
