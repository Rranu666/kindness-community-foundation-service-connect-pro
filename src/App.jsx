import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Login from '@/pages/Login';
import HomeownerDashboard from '@/pages/HomeownerDashboard';
import Favorites from '@/pages/Favorites';
import Inbox from '@/pages/Inbox';
import ProviderAnalytics from '@/pages/ProviderAnalytics';
import Dashboard from '@/pages/Dashboard';
import VoicePlatformRequirements from '@/pages/VoicePlatformRequirements';
import Blog from '@/pages/Blog';
import BlogArticle from '@/pages/BlogArticle';
import About from '@/pages/About';
import PlumbingServices from '@/pages/PlumbingServices';
import HVACServices from '@/pages/HVACServices';
import CleaningServices from '@/pages/CleaningServices';
import EmergencyRepairs from '@/pages/EmergencyRepairs';
import RecurringServices from '@/pages/RecurringServices';
import CityServices from '@/pages/CityServices';
import LocationServicePage from '@/pages/LocationServicePage';
import PrivacyCompliance from '@/pages/PrivacyCompliance';
import ErrorBoundary from '@/lib/ErrorBoundary';
import LoadingScreen from '@/components/ui/LoadingScreen';
import OfflineBanner from '@/components/ui/OfflineBanner';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return <LoadingScreen message="Loading platform..." />;
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={
          <PageTransition>
            <LayoutWrapper currentPageName={mainPageKey}>
              <MainPage />
            </LayoutWrapper>
          </PageTransition>
        } />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <PageTransition>
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              </PageTransition>
            }
          />
        ))}

        <Route path="/blog" element={<PageTransition><LayoutWrapper currentPageName="Blog"><Blog /></LayoutWrapper></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><LayoutWrapper currentPageName="BlogArticle"><BlogArticle /></LayoutWrapper></PageTransition>} />
        <Route path="/BlogArticle" element={<PageTransition><LayoutWrapper currentPageName="BlogArticle"><BlogArticle /></LayoutWrapper></PageTransition>} />
        <Route path="/About" element={<PageTransition><LayoutWrapper currentPageName="About"><About /></LayoutWrapper></PageTransition>} />
        <Route path="/PlumbingServices" element={<PageTransition><LayoutWrapper currentPageName="PlumbingServices"><PlumbingServices /></LayoutWrapper></PageTransition>} />
        <Route path="/HVACServices" element={<PageTransition><LayoutWrapper currentPageName="HVACServices"><HVACServices /></LayoutWrapper></PageTransition>} />
        <Route path="/CleaningServices" element={<PageTransition><LayoutWrapper currentPageName="CleaningServices"><CleaningServices /></LayoutWrapper></PageTransition>} />
        <Route path="/EmergencyRepairs" element={<PageTransition><LayoutWrapper currentPageName="EmergencyRepairs"><EmergencyRepairs /></LayoutWrapper></PageTransition>} />
        <Route path="/RecurringServices" element={<PageTransition><LayoutWrapper currentPageName="RecurringServices"><RecurringServices /></LayoutWrapper></PageTransition>} />
        
        {/* City Service Pages */}
        {['los-angeles', 'san-diego', 'san-francisco', 'san-jose', 'sacramento', 'orange-county', 'riverside', 'fresno'].map(city => (
          <Route key={city} path={`/${city}-home-services`} element={<PageTransition><LayoutWrapper currentPageName="CityServices"><CityServices /></LayoutWrapper></PageTransition>} />
        ))}

        {/* Location + Service Pages (e.g., /services/los-angeles/plumbing) */}
        <Route path="/services/:city/:service" element={<PageTransition><LayoutWrapper currentPageName="LocationServicePage"><LocationServicePage /></LayoutWrapper></PageTransition>} />

        {/* Privacy & Compliance */}
        <Route path="/privacy" element={<PageTransition><LayoutWrapper currentPageName="PrivacyCompliance"><PrivacyCompliance /></LayoutWrapper></PageTransition>} />

        {/* Extra pages not in pages.config */}
        <Route path="/Dashboard" element={<PageTransition><LayoutWrapper currentPageName="Dashboard"><Dashboard /></LayoutWrapper></PageTransition>} />
        <Route path="/VoicePlatformRequirements" element={<PageTransition><LayoutWrapper currentPageName="VoicePlatformRequirements"><VoicePlatformRequirements /></LayoutWrapper></PageTransition>} />
        <Route path="/Favorites" element={<PageTransition><LayoutWrapper currentPageName="Favorites"><Favorites /></LayoutWrapper></PageTransition>} />
        <Route path="/Inbox" element={<PageTransition><LayoutWrapper currentPageName="Inbox"><Inbox /></LayoutWrapper></PageTransition>} />
        <Route path="/ProviderAnalytics" element={<PageTransition><LayoutWrapper currentPageName="ProviderAnalytics"><ProviderAnalytics /></LayoutWrapper></PageTransition>} />

        {/* Auth — no layout wrapper */}
        <Route path="/Login" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};


function App() {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <ErrorBoundary>
              <AuthenticatedApp />
            </ErrorBoundary>
          </Router>
          <OfflineBanner />
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App