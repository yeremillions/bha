import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Bookings from "./pages/Bookings";
import BookingDetails from "./pages/BookingDetails";
import Calendar from "./pages/Calendar";
import Housekeeping from "./pages/Housekeeping";
import Bar from "./pages/Bar";
import BarTabDetails from "./pages/BarTabDetails";
import Maintenance from "./pages/Maintenance";
import MaintenanceDetails from "./pages/MaintenanceDetails";
import Vendors from "./pages/Vendors";
import VendorDetails from "./pages/VendorDetails";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/properties" element={<Properties />} />
              <Route path="/dashboard/bookings" element={<Bookings />} />
              <Route path="/dashboard/bookings/:id" element={<BookingDetails />} />
              <Route path="/dashboard/calendar" element={<Calendar />} />
              <Route path="/dashboard/housekeeping" element={<Housekeeping />} />
              <Route path="/dashboard/bar" element={<Bar />} />
              <Route path="/dashboard/bar/:id" element={<BarTabDetails />} />
              <Route path="/dashboard/maintenance" element={<Maintenance />} />
              <Route path="/dashboard/maintenance/:id" element={<MaintenanceDetails />} />
              <Route path="/dashboard/vendors" element={<Vendors />} />
              <Route path="/dashboard/vendors/:id" element={<VendorDetails />} />
              <Route path="/dashboard/reports" element={<Reports />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;