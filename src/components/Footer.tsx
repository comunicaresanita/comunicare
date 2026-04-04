import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import logo from "@/assets/comunicare-logo.png";

const Footer = () => {
  return (
    <footer className="bg-medical-dark text-primary-foreground">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src={logo} alt="ComuniCARE" className="h-14 mb-4" />
            <p className="text-senior-sm opacity-80">
              Servizi infermieristici a domicilio a Firenze. Qualità, professionalità e cura.
            </p>
          </div>
          <div>
            <h4 className="text-senior-lg font-semibold mb-4">Link utili</h4>
            <ul className="space-y-2 text-senior-sm">
              <li><Link to="/termini" className="opacity-80 hover:opacity-100 transition-opacity">Termini e Condizioni</Link></li>
              <li><Link to="/privacy" className="opacity-80 hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-senior-lg font-semibold mb-4">Contatti</h4>
            <ul className="space-y-2 text-senior-sm opacity-80">
              <li>Email: comunicaresanita@gmail.com</li>
              <li>Firenze, Italia</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-primary-foreground/20">
          <p className="text-senior-sm text-center opacity-90 font-medium leading-relaxed">
            ComuniCARE è un fornitore di servizi di intermediazione. La responsabilità della prestazione sanitaria è esclusivamente in capo al professionista abilitato.
          </p>
          <p className="text-sm text-center opacity-60 mt-4">
            © {new Date().getFullYear()} ComuniCARE.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
