import { Link } from "react-router-dom";
import logo from "@/assets/comunicare-logo.png";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="ComuniCARE" className="h-14 md:h-16" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/registrazione">
            <Button size="lg" className="text-senior-sm font-semibold px-6 py-3">
              Registrati
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
