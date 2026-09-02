import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/comunicare-logo-header.png";
import { Menu, LogOut, Phone, Home, User, LayoutDashboard, HelpCircle, ClipboardList, BriefcaseMedical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AuthHeader = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const logoTarget = user
    ? profile?.role === "professionista"
      ? "/dashboard-professionista"
      : "/"
    : "/";

  const handleHomeClick = () => {
    if (location.pathname === "/" || location.pathname === "/dashboard-paziente") {
      window.location.reload();
    } else {
      navigate("/");
    }
  };

  const requireAuth = (to: string, message: string) => {
    navigate("/login", { state: { redirect: to, message } });
  };

  const isProfessionista = profile?.role === "professionista";

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2">
        <Link to={logoTarget} className="flex items-center flex-shrink-0">
          <img src={logo} alt="ComuniCARE" className="h-12 md:h-20" />
        </Link>
        {user ? (
          <div className="flex items-center gap-1 md:gap-2">
            <nav className="flex items-center gap-0.5 md:gap-1">
              {isProfessionista ? (
                <Button asChild variant="ghost" size="sm" className="gap-1.5 px-2 md:px-3">
                  <Link to="/dashboard-professionista">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs md:text-sm">Dashboard</span>
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHomeClick}
                  className="gap-1.5 px-2 md:px-3"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs md:text-sm">Home</span>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm" className="gap-1.5 px-2 md:px-3">
                <Link to="/profilo">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs md:text-sm">Profilo</span>
                </Link>
              </Button>
              {!isProfessionista && (
                <Button asChild variant="ghost" size="sm" className="gap-1.5 px-2 md:px-3">
                  <Link to="/storico-prestazioni">
                    <ClipboardList className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs md:text-sm">Storico</span>
                  </Link>
                </Button>
              )}
            </nav>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 px-2 md:px-3">
                  <Menu className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs md:text-sm">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/contatti" className="cursor-pointer"><Phone className="w-4 h-4 mr-2" />Contatti</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/contatti#faq" className="cursor-pointer"><HelpCircle className="w-4 h-4 mr-2" />FAQ</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Esci
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link to="/login">
            <Button className="px-5 py-3 md:px-8 md:py-5 text-sm md:text-base">Accedi</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default AuthHeader;
