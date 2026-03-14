/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminMultiCity from './pages/AdminMultiCity';
import Browse from './pages/Browse';
import CustomerProfile from './pages/CustomerProfile';
import Home from './pages/Home';
import OrderTracking from './pages/OrderTracking';
import Orders from './pages/Orders';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderPayouts from './pages/ProviderPayouts';
import ProviderProfile from './pages/ProviderProfile';
import ProviderSignup from './pages/ProviderSignup';
import ReferralProgram from './pages/ReferralProgram';
import ServiceDetails from './pages/ServiceDetails';
import SubscriptionManagement from './pages/SubscriptionManagement';
import Support from './pages/Support';
import TermsAndPrivacy from './pages/TermsAndPrivacy';
import VoiceRequest from './pages/VoiceRequest';
import Wallet from './pages/Wallet';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Login": Login,
    "AdminDashboard": AdminDashboard,
    "AdminMultiCity": AdminMultiCity,
    "Browse": Browse,
    "CustomerProfile": CustomerProfile,
    "Home": Home,
    "OrderTracking": OrderTracking,
    "Orders": Orders,
    "ProviderDashboard": ProviderDashboard,
    "ProviderPayouts": ProviderPayouts,
    "ProviderProfile": ProviderProfile,
    "ProviderSignup": ProviderSignup,
    "ReferralProgram": ReferralProgram,
    "ServiceDetails": ServiceDetails,
    "SubscriptionManagement": SubscriptionManagement,
    "Support": Support,
    "TermsAndPrivacy": TermsAndPrivacy,
    "VoiceRequest": VoiceRequest,
    "Wallet": Wallet,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};