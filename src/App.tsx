import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Registrazione from "./pages/Registrazione.tsx";
import Termini from "./pages/Termini.tsx";
import Privacy from "./pages/Privacy.tsx";
import NotFound from "./pages/NotFound.tsx";
import SetupProfessionista from "./pages/SetupProfessionista.tsx";
import SetupDisponibilita from "./pages/SetupDisponibilita.tsx";
import DashboardProfessionista from "./pages/DashboardProfessionista.tsx";
import DashboardPaziente from "./pages/DashboardPaziente.tsx";
import ProfiloInfermiere from "./pages/ProfiloInfermiere.tsx";
import Login from "./pages/Login.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import PagamentoSuccesso from "./pages/PagamentoSuccesso.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import Profilo from "./pages/Profilo.tsx";
import SetupPosizione from "./pages/SetupPosizione.tsx";
import Contatti from "./pages/Contatti.tsx";
import Blog from "./pages/Blog.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registrazione" element={<Registrazione />} />
            <Route path="/termini" element={<Termini />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/setup-professionista" element={<SetupProfessionista />} />
            <Route path="/setup-professionista/disponibilita" element={<SetupDisponibilita />} />
            <Route path="/setup-professionista/posizione" element={<SetupPosizione />} />
            <Route path="/dashboard-professionista" element={<DashboardProfessionista />} />
            <Route path="/dashboard-paziente" element={<DashboardPaziente />} />
            <Route path="/profilo-infermiere/:id" element={<ProfiloInfermiere />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pagamento-successo" element={<PagamentoSuccesso />} />
            <Route path="/profilo" element={<Profilo />} />
            <Route path="/contatti" element={<Contatti />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
