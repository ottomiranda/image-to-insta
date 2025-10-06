import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Create from "./pages/Create";
import Campaigns from "./pages/Campaigns";
import CampaignDetails from "./pages/CampaignDetails";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import BrandAnalytics from "./pages/BrandAnalytics";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OnboardingTour } from "@/components/OnboardingTour";
import "./i18n/config";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/campaigns" 
            element={
              <ProtectedRoute>
                <Campaigns />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create/:campaignId" 
            element={
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/campaigns/:campaignId" 
            element={
              <ProtectedRoute>
                <CampaignDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/brand-analytics"
            element={
              <ProtectedRoute>
                <BrandAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/campaigns" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
