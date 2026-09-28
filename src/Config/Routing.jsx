import { Routes, Route, Outlet } from 'react-router-dom';

import Header from '../Components/Sections/Header';
import Footer from '../Components/Sections/Footer';
import ScrollToTop from '../Components/ScrollToTop';
import ManageFarmers from '../Dashboards/Pages/ManageFarmers';
import ManageCustomers from '../Dashboards/Pages/ManageCustomers';
import ManageMarkets from '../Dashboards/Pages/ManageMarkets';
import ContentModeration from '../Dashboards/Pages/ContentModeration';
import PlatformReports from '../Dashboards/Pages/PlatformReports';
import ManageOrders from '../Dashboards/Pages/ManageOrders';
import SystemConfig from '../Dashboards/Pages/SystemConfig';

// Pages
import Home from '../Pages/Home/Home';
import Favorites from '../Pages/Favorites/Favorites';
import Services from '../Pages/Services/Products';
import AllServices from '../Pages/Services/Sections/AllProducts';
import InspectServices from '../Pages/Services/Sections/InspectProduct';
import About from '../Pages/About/About';
import Blog from '../Pages/Blog/Blog';
import Contact from '../Pages/Contact/Contact';
import Profiles from '../Pages/Profile/Profile';
import PreOrders from '../Pages/PreOrders/PreOrders';

// Auth Pages
import Login from '../Pages/Auth/Pages/Login';
import Register from '../Pages/Auth/Pages/Register';
import ForgotPassword from '../Pages/Auth/Pages/ForgotPassword';
import ProtectedVerifyRoute from './ProtectedVerifyRoute';

// Protected Route Guard
import ProtectedRoute from './ProtectedRoute';
import FarmerDashboard from '../Dashboards/Pages/FarmerDashboard';
import AdminDashboard from '../Dashboards/Pages/AdminDashboard';
import Market from '../Pages/Work/Market';
import SehatAI from '../Components/SehatAI';
import FarmerProfile from '../Pages/Profile copy/Sections/FarmerProfile';
import MarketDetail from '../Pages/Work/Sections/MarketDetail';

// Website Layout Component
function WebsiteLayout() {
    return (
        <>
            <Header />
            <Outlet />
            <SehatAI />
            <Footer />
        </>
    );
}

function Routing() {
    return (
        <>
            <ScrollToTop />

            <Routes>
                {/* 1. PUBLIC & AUTH VERIFICATION ROUTES */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<ProtectedVerifyRoute />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* 2. STRICT PROTECTED ROUTES */}
                <Route element={<ProtectedRoute />}>
                    {/* Website Pages With Header & Footer */}
                    <Route element={<WebsiteLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/markets" element={<Market />} />
                        <Route path="/market/:marketId" element={<MarketDetail />} />
                        <Route path="/farmer/:farmerId" element={<FarmerProfile />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/profile" element={<Profiles />} />
                        <Route path="/AllServices" element={<AllServices />} />
                        <Route path="/InspectServices" element={<InspectServices />} />
                        <Route path="/About" element={<About />} />
                        <Route path="/pre-orders" element={<PreOrders />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admin/farmers" element={<ManageFarmers />} />
                        <Route path="/admin/customers" element={<ManageCustomers />} />
                        <Route path="/admin/markets" element={<ManageMarkets />} />
                        <Route path="/admin/moderation" element={<ContentModeration />} />
                        <Route path="/admin/reports" element={<PlatformReports />} />
                        <Route path="/admin/orders" element={<ManageOrders />} />
                        <Route path="/admin/system-config" element={<SystemConfig />} />
                    </Route>

                    {/* Dashboards Without Header & Footer */}
                    <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
                        <Route path="/farmerdashboard" element={<FarmerDashboard />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admindashboard" element={<AdminDashboard />} />
                    </Route>
                </Route>
            </Routes>
        </>
    );
}

export default Routing;