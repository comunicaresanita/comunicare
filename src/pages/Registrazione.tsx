import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Stethoscope, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Ruolo = "paziente" | "professionista";

const Registrazione = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("ruolo") === "professionista" ? "professionista" : null;
  const [ruolo, setRuolo] = useState<Ruolo | null>(initialRole);
  const [consensoTermini, setConsensoTermini] = useState(false);
  const [consensoPrivacy, setConsensoPrivacy] = useState(false);
  const [consensoSanitario, setConsensoSanitario] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!consensoTermini || !consensoPrivacy) {
      toast({
        title: "Consensi obbligatori",
        description: "Devi accettare tutti i consensi obbligatori per procedere.",
        variant: "destructive",
      });
      return;
    }

    if (ruolo === "paziente" && !consensoSanitario) {
      toast({
        title: "Consenso obbligatorio",
        description: "Devi acconsentire al trattamento dei dati sanitari per procedere.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Registrazione completata!",
      description: "Il tuo account è stato creato con successo.",
    });
  };

  if (!ruolo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background py-16">
          <div className="container mx-auto px-6 max-w-2xl">
            <h1 className="text-senior-2xl md:text-senior-3xl font-bold text-center mb-4">
              Crea il tuo Account
            </h1>
            <p className="text-senior-base text-muted-foreground text-center mb-10">
              Seleziona il tuo profilo per iniziare la registrazione.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card
                className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all"
                onClick={() => setRuolo("paziente")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-senior-xl font-semibold mb-2">Paziente</h3>
                  <p className="text-senior-sm text-muted-foreground">
                    Cerca e prenota servizi infermieristici a domicilio.
                  </p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all"
                onClick={() => setRuolo("professionista")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
                    <Stethoscope className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-senior-xl font-semibold mb-2">Professionista</h3>
                  <p className="text-senior-sm text-muted-foreground">
                    Offri i tuoi servizi infermieristici sulla piattaforma.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <Button
            variant="ghost"
            className="mb-6 text-senior-sm"
            onClick={() => setRuolo(null)}
          >
            ← Torna alla selezione
          </Button>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-senior-xl">
                Registrazione {ruolo === "paziente" ? "Paziente" : "Professionista"}
              </CardTitle>
              <CardDescription className="text-senior-sm">
                {ruolo === "paziente"
                  ? "Inserisci i tuoi dati per cercare e prenotare servizi."
                  : "Inserisci i tuoi dati professionali per offrire servizi."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dati personali */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-senior-sm">Nome *</Label>
                    <Input id="nome" placeholder="Il tuo nome" required className="text-senior-sm py-3" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cognome" className="text-senior-sm">Cognome *</Label>
                    <Input id="cognome" placeholder="Il tuo cognome" required className="text-senior-sm py-3" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-senior-sm">Email *</Label>
                  <Input id="email" type="email" placeholder="email@esempio.it" required className="text-senior-sm py-3" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-senior-sm">Password *</Label>
                  <Input id="password" type="password" placeholder="Minimo 8 caratteri" required minLength={8} className="text-senior-sm py-3" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indirizzo" className="text-senior-sm">Indirizzo *</Label>
                  <Input id="indirizzo" placeholder="Via, numero civico, Firenze" required className="text-senior-sm py-3" />
                </div>

                {/* Campi professionista */}
                {ruolo === "professionista" && (
                  <>
                    <div className="border-t pt-6">
                      <h3 className="text-senior-lg font-semibold mb-4">Dati Professionali</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="numero_opi" className="text-senior-sm">Numero Iscrizione OPI *</Label>
                          <Input id="numero_opi" placeholder="Es. FI-12345" required className="text-senior-sm py-3" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tariffa" className="text-senior-sm">Tariffa Oraria (€) *</Label>
                          <Input id="tariffa" type="number" min="1" placeholder="Es. 35" required className="text-senior-sm py-3" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-senior-sm">Bio / Specializzazioni</Label>
                          <Textarea id="bio" placeholder="Descrivi la tua esperienza e le tue specializzazioni..." className="text-senior-sm" rows={3} />
                        </div>
                      </div>
                    </div>

                    {/* Upload documenti */}
                    <div className="border-t pt-6">
                      <h3 className="text-senior-lg font-semibold mb-4">Documenti di Verifica</h3>
                      <p className="text-senior-sm text-muted-foreground mb-4">
                        Carica i documenti richiesti per la verifica del tuo profilo. I file saranno conservati in modo sicuro e non saranno accessibili pubblicamente.
                      </p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="doc_identita" className="text-senior-sm">Documento d'Identità *</Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <Input id="doc_identita" type="file" accept=".pdf,.jpg,.jpeg,.png" required className="text-senior-sm" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cert_opi" className="text-senior-sm">Certificato Iscrizione OPI *</Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <Input id="cert_opi" type="file" accept=".pdf,.jpg,.jpeg,.png" required className="text-senior-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Consensi */}
                <div className="border-t pt-6">
                  <h3 className="text-senior-lg font-semibold mb-4">Consensi Obbligatori</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="consenso_termini"
                        checked={consensoTermini}
                        onCheckedChange={(checked) => setConsensoTermini(checked === true)}
                        className="mt-1"
                      />
                      <Label htmlFor="consenso_termini" className="text-senior-sm leading-relaxed cursor-pointer">
                        Accetto i{" "}
                        <Link to="/termini" className="text-primary underline font-medium" target="_blank">
                          Termini e Condizioni
                        </Link>{" "}
                        del servizio. *
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="consenso_privacy"
                        checked={consensoPrivacy}
                        onCheckedChange={(checked) => setConsensoPrivacy(checked === true)}
                        className="mt-1"
                      />
                      <Label htmlFor="consenso_privacy" className="text-senior-sm leading-relaxed cursor-pointer">
                        Acconsento al trattamento dei miei dati personali ai sensi del{" "}
                        <Link to="/privacy" className="text-primary underline font-medium" target="_blank">
                          GDPR (Reg. UE 2016/679)
                        </Link>
                        . *
                      </Label>
                    </div>
                    {ruolo === "paziente" && (
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="consenso_sanitario"
                          checked={consensoSanitario}
                          onCheckedChange={(checked) => setConsensoSanitario(checked === true)}
                          className="mt-1"
                        />
                        <Label htmlFor="consenso_sanitario" className="text-senior-sm leading-relaxed cursor-pointer">
                          Acconsento al trattamento dei dati sanitari (dati particolari ex Art. 9 GDPR) necessari per l'erogazione del servizio. *
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full text-senior-base font-semibold py-6">
                  Completa Registrazione
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Registrazione;
