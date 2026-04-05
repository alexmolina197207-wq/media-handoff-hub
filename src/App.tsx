import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/app/Dashboard";
import Library from "./pages/app/Library";
import UploadPage from "./pages/app/UploadPage";
import Folders from "./pages/app/Folders";
import Collections from "./pages/app/Collections";
import SharedLinks from "./pages/app/SharedLinks";
import Storage from "./pages/app/Storage";
import Analytics from "./pages/app/Analytics";
import AppSettings from "./pages/app/AppSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/app/library" element={<DashboardLayout><Library /></DashboardLayout>} />
            <Route path="/app/upload" element={<DashboardLayout><UploadPage /></DashboardLayout>} />
            <Route path="/app/folders" element={<DashboardLayout><Folders /></DashboardLayout>} />
            <Route path="/app/collections" element={<DashboardLayout><Collections /></DashboardLayout>} />
            <Route path="/app/shared" element={<DashboardLayout><SharedLinks /></DashboardLayout>} />
            <Route path="/app/storage" element={<DashboardLayout><Storage /></DashboardLayout>} />
            <Route path="/app/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
            <Route path="/app/settings" element={<DashboardLayout><AppSettings /></DashboardLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
