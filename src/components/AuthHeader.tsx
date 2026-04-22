import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/comunicare-logo.png";
import { User, LogOut, Phone, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AuthHeader = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link to={user ? (profile?.role === "professionista" ? "/dashboard-professionista" : "/dashboard-paziente") : "/"} className="flex items-center">
          <img src={logo} alt="ComuniCARE" className="h-10 md:h-16" />
        </Link>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1.5 md:gap-2 text-xs md:text-sm px-3 md:px-4">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Il tuo profilo</span>
                <span className="sm:hidden">Profilo</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {profile?.role === "professionista" && (
                <DropdownMenuItem asChild>
                  <Link to="/dashboard-professionista" className="cursor-pointer">Dashboard</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link to="/profilo" className="cursor-pointer">Il mio profilo</Link>
              </DropdownMenuItem>
              {profile?.role !== "professionista" && (
                <DropdownMenuItem asChild>
                  <Link to="/dashboard-paziente" className="cursor-pointer">🗓️ Prenota</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link to="/contatti" className="cursor-pointer"><Phone className="w-4 h-4 mr-2" />Contatti</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/blog" className="cursor-pointer"><BookOpen className="w-4 h-4 mr-2" />Blog</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Esci
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
