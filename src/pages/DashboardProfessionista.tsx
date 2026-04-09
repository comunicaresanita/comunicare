import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Settings, MapPin } from "lucide-react";

const DashboardProfessionista = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-3xl">
          <h1 className="text-senior-2xl md:text-senior-3xl font-bold mb-2">
            Dashboard professionista
          </h1>
          </h1>
          <p className="text-senior-base text-muted-foreground mb-8">
            Gestisci il tuo profilo, i tuoi servizi e le tue disponibilità.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/setup-professionista")}>
              <CardContent className="p-6 text-center">
                <Settings className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="text-senior-base font-semibold">Servizi e Prezzi</h3>
                <p className="text-sm text-muted-foreground mt-1">Modifica i tuoi servizi</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/setup-professionista/disponibilita")}>
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="text-senior-base font-semibold">Disponibilità</h3>
                <p className="text-sm text-muted-foreground mt-1">Gestisci il calendario</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/setup-professionista/posizione")}>
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="text-senior-base font-semibold">Posizione</h3>
                <p className="text-sm text-muted-foreground mt-1">Aggiorna il segnalino</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-senior-base text-muted-foreground">
                Le prenotazioni ricevute appariranno qui. Per ora il tuo profilo è in fase di configurazione.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardProfessionista;
