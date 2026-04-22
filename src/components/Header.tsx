import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/comunicare-logo.png";

const Header = () => {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="ComuniCARE" className="h-12 md:h-20" />
        </Link>
        <Link to="/login">
          <Button className="px-5 py-3 md:px-8 md:py-5 text-sm md:text-base">
            Accedi
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
