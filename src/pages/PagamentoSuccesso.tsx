import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";

const PagamentoSuccesso = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 bg-background py-16 flex items-center justify-center">
        <Card className="w-full max-w-md mx-6 text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-senior-2xl font-bold mb-2">Pagamento completato</h1>
            <p className="text-senior-base text-muted-foreground mb-6">
              La tua prenotazione è stata confermata. Riceverai una conferma via email.
            </p>
            <Link to="/dashboard-paziente">
              <Button className="w-full py-5">Torna alla dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PagamentoSuccesso;
