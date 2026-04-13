import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { Heart, MapPin, Calendar, UserCheck } from "lucide-react";

const features = [
  {
    icon: UserCheck,
    title: "Professionisti verificati",
    description: "Infermieri, OSS e fisioterapisti con documenti verificati dalla piattaforma.",
  },
  {
    icon: MapPin,
    title: "Vicino a te",
    description: "Trova professionisti sanitari nella tua zona, con calcolo della distanza dal tuo domicilio.",
  },
  {
    icon: Calendar,
    title: "Prenotazione facile",
    description: "Scegli lo slot orario disponibile e prenota in pochi tocchi.",
  },
  {
    icon: Heart,
    title: "Cura personalizzata",
    description: "Ogni paziente riceve un'attenzione dedicata e un servizio su misura.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section style={{ backgroundColor: 'hsl(195, 60%, 97%)' }} className="py-12 md:py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-senior-3xl md:text-senior-4xl font-bold text-foreground mb-6 max-w-3xl mx-auto leading-tight">
            Assistenza sanitaria a <span style={{ color: '#0097B2' }}>domicilio</span>
          </h1>
          <p className="text-senior-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Trova il professionista sanitario più vicino a te, prenota online e ricevi cure di qualità direttamente a casa tua.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/registrazione?ruolo=paziente">
              <Button size="lg" className="px-10 py-6 w-full sm:w-auto">
                Cerchi un professionista?
              </Button>
            </Link>
            <Link to="/registrazione?ruolo=professionista">
              <Button variant="outline" size="lg" className="px-10 py-6 w-full sm:w-auto border-2">
                Sono un professionista
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="container mx-auto px-6">
        <hr className="border-t border-border/70" />
      </div>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-senior-2xl md:text-senior-3xl font-bold text-center mb-4">
            Perché scegliere Comuni<span style={{ color: '#0097B2' }}>CARE</span>
          </h2>
          <p className="text-senior-base text-muted-foreground text-center mb-14 max-w-xl mx-auto">
            Una piattaforma pensata per la semplicità e la sicurezza.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-5">
                    <f.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-senior-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-senior-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="container mx-auto px-6">
        <hr className="border-t border-border/70" />
      </div>

      {/* CTA */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-senior-2xl md:text-senior-3xl font-bold text-foreground mb-4">
            Pronto per iniziare?
          </h2>
          <p className="text-senior-base text-muted-foreground mb-8 max-w-lg mx-auto">
            Registrati gratuitamente e accedi ai nostri servizi sanitari a domicilio.
          </p>
          <Link to="/registrazione">
            <Button size="lg" className="px-10 py-6">
              Registrati gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
