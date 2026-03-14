import { Routes, Route } from 'react-router-dom';
import Landing from './Pages/Landing.jsx';
import CreateAccount from './Pages/CreateAccount.jsx';
import Login from './Pages/Login.jsx';
import ForgotPassword from './Pages/ForgotPassword.jsx';
import ResetPassword from './Pages/ResetPassword.jsx';
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
import ClothingDetail from './Pages/ClothingDetail.jsx';
import ChatPage from './Pages/ChatPage.jsx';
import StoreProfile from './Pages/StoreProfile.jsx';
import NearbyStores from './Pages/NearbyStores.jsx';
import MyReviews from './Pages/MyReviews.jsx';
import UserProfile from './Pages/UserProfile.jsx';
import PaymentSuccess from './Pages/PaymentSuccess.jsx';
import PaymentFailure from './Pages/PaymentFailure.jsx';
import DamageReports from './Pages/DamageReports.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx';
import AdminUserManagement from './Pages/AdminUserManagement.jsx';
import AdminActivity from './Pages/AdminActivity.jsx';
import StoreReports from './Pages/StoreReports.jsx';

import AdminClothingApproval from './Pages/AdminClothingApproval.jsx';


import PrivacySecurity from "./Pages/PrivacySecurity.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/createAccount" element={<CreateAccount />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
      <Route path="/clothing/:id" element={<ClothingDetail />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/myrentals" element={<MyRentals />} />
      <Route path="/storerentals" element={<StoreRentals />} />
      <Route path="/rentmanagement" element={<RentManagement />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/chat/:id" element={<ChatPage />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/storeProfile" element={<StoreProfile />} />
      <Route path="/storeLocation" element={<StoreProfile />} />
      <Route path="/nearbyStores" element={<NearbyStores />} />
      <Route path="/privacy-security" element={<PrivacySecurity />} />
      <Route path="/myreviews" element={<MyReviews />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failure" element={<PaymentFailure />} />
      <Route path="/damaged-items" element={<DamageReports />} />
      <Route path="/adminDashboard" element={<AdminDashboard />} />
      <Route path="/adminUsers" element={<AdminUserManagement />} />
      <Route path="/adminActivity" element={<AdminActivity />} />
      <Route path="/reports" element={<StoreReports />} />

      <Route path="/adminClothingApproval" element={<AdminClothingApproval />} />
    </Routes>

  );
}

export default App;
