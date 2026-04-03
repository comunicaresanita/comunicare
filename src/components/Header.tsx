import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/comunicare-logo.png";

const Header = () => {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="ComuniCARE" className="h-14 md:h-16" />
        </Link>
        <Link to="/login">
          <Button className="px-8 py-5">
            Accedi
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
