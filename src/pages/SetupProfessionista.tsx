import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Plus, Trash2, Info, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Servizio {
  id: string;
  nome: string;
  prezzo: number;
  prezzoConsigliato: number;
  attivo: boolean;
  personalizzato?: boolean;
}

const serviziPredefiniti: Omit<Servizio, "id" | "attivo">[] = [
  { nome: "Iniezione intramuscolare", prezzo: 15, prezzoConsigliato: 15, personalizzato: false },
  { nome: "Iniezione sottocutanea", prezzo: 15, prezzoConsigliato: 15, personalizzato: false },
  { nome: "Prelievo ematico a domicilio", prezzo: 25, prezzoConsigliato: 25, personalizzato: false },
  { nome: "Medicazione semplice", prezzo: 20, prezzoConsigliato: 20, personalizzato: false },
  { nome: "Medicazione complessa", prezzo: 35, prezzoConsigliato: 35, personalizzato: false },
  { nome: "Rimozione punti di sutura", prezzo: 25, prezzoConsigliato: 25, personalizzato: false },
  { nome: "Cateterismo vescicale", prezzo: 40, prezzoConsigliato: 40, personalizzato: false },
  { nome: "Gestione catetere vescicale", prezzo: 30, prezzoConsigliato: 30, personalizzato: false },
  { nome: "Clistere evacuativo", prezzo: 25, prezzoConsigliato: 25, personalizzato: false },
  { nome: "Infusione endovenosa (flebo)", prezzo: 40, prezzoConsigliato: 40, personalizzato: false },
  { nome: "Terapia infusionale sottocutanea", prezzo: 35, prezzoConsigliato: 35, personalizzato: false },
  { nome: "Misurazione parametri vitali", prezzo: 15, prezzoConsigliato: 15, personalizzato: false },
  { nome: "Gestione stomie", prezzo: 35, prezzoConsigliato: 35, personalizzato: false },
  { nome: "Assistenza post-operatoria", prezzo: 45, prezzoConsigliato: 45, personalizzato: false },
  { nome: "Educazione sanitaria al paziente", prezzo: 30, prezzoConsigliato: 30, personalizzato: false },
  { nome: "Somministrazione terapia orale", prezzo: 12, prezzoConsigliato: 12, personalizzato: false },
  { nome: "Gestione nutrizione enterale (SNG/PEG)", prezzo: 40, prezzoConsigliato: 40, personalizzato: false },
  { nome: "Bendaggio compressivo", prezzo: 25, prezzoConsigliato: 25, personalizzato: false },
  { nome: "Assistenza domiciliare continuativa (per ora)", prezzo: 30, prezzoConsigliato: 30, personalizzato: false },
  { nome: "ECG a domicilio", prezzo: 50, prezzoConsigliato: 50, personalizzato: false },
];

const SetupProfessionista = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [servizi, setServizi] = useState<Servizio[]>(
    serviziPredefiniti.map((s, i) => ({ ...s, id: `srv-${i}`, attivo: false }))
  );
  const [nuovoServizio, setNuovoServizio] = useState("");
  const [nuovoPrezzo, setNuovoPrezzo] = useState("");

  const toggleServizio = (id: string) => {
    setServizi((prev) =>
      prev.map((s) => (s.id === id ? { ...s, attivo: !s.attivo } : s))
    );
  };

  const updatePrezzo = (id: string, prezzo: number) => {
    setServizi((prev) =>
      prev.map((s) => (s.id === id ? { ...s, prezzo } : s))
    );
  };

  const aggiungiServizio = () => {
    if (!nuovoServizio.trim() || !nuovoPrezzo) return;
    const nuovo: Servizio = {
      id: `srv-custom-${Date.now()}`,
      nome: nuovoServizio.trim(),
      prezzo: Number(nuovoPrezzo),
      prezzoConsigliato: Number(nuovoPrezzo),
      attivo: true,
      personalizzato: true,
    };
    setServizi((prev) => [...prev, nuovo]);
    setNuovoServizio("");
    setNuovoPrezzo("");
  };

  const rimuoviServizio = (id: string) => {
    setServizi((prev) => prev.filter((s) => s.id !== id));
  };

  const serviziAttivi = servizi.filter((s) => s.attivo);

  const handleContinua = () => {
    if (serviziAttivi.length === 0) {
      toast({
        title: "Seleziona almeno un servizio",
        description: "Devi attivare almeno un servizio per continuare.",
        variant: "destructive",
      });
      return;
    }
    navigate("/setup-professionista/disponibilita");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
              <h1 className="text-senior-2xl font-bold">I Tuoi Servizi</h1>
            </div>
            <p className="text-senior-base text-muted-foreground ml-[52px]">
              Seleziona i servizi che offri e imposta i tuoi prezzi. I prezzi consigliati sono basati sulle tariffe medie di mercato.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-senior-lg">Servizi Disponibili</CardTitle>
              <CardDescription className="text-senior-sm">
                Attiva i servizi che desideri offrire e personalizza il prezzo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {servizi.map((servizio) => (
                  <div
                    key={servizio.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      servizio.attivo ? "border-primary bg-secondary/50" : "border-border"
                    }`}
                  >
                    <Checkbox
                      checked={servizio.attivo}
                      onCheckedChange={() => toggleServizio(servizio.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-senior-sm font-medium truncate">{servizio.nome}</p>
                      {servizio.attivo && !servizio.personalizzato && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Info className="w-3 h-3" />
                          Consigliato: €{servizio.prezzoConsigliato}
                        </p>
                      )}
                    </div>
                    {servizio.attivo && (
                      <div className="flex items-center gap-2">
                        <span className="text-senior-sm">€</span>
                        <Input
                          type="number"
                          min="1"
                          value={servizio.prezzo}
                          onChange={(e) => updatePrezzo(servizio.id, Number(e.target.value))}
                          className="w-20 text-center"
                        />
                      </div>
                    )}
                    {servizio.personalizzato && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => rimuoviServizio(servizio.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Aggiungi servizio personalizzato */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-senior-lg">Aggiungi Servizio Personalizzato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="nuovo_servizio" className="text-senior-sm">Nome Servizio</Label>
                  <Input
                    id="nuovo_servizio"
                    value={nuovoServizio}
                    onChange={(e) => setNuovoServizio(e.target.value)}
                    placeholder="Es. Assistenza notturna"
                    className="mt-1"
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor="nuovo_prezzo" className="text-senior-sm">Prezzo (€)</Label>
                  <Input
                    id="nuovo_prezzo"
                    type="number"
                    min="1"
                    value={nuovoPrezzo}
                    onChange={(e) => setNuovoPrezzo(e.target.value)}
                    placeholder="€"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={aggiungiServizio} className="gap-2">
                    <Plus className="w-4 h-4" /> Aggiungi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {serviziAttivi.length > 0 && (
            <div className="bg-secondary/50 rounded-lg p-4 mb-8">
              <p className="text-senior-sm font-medium">
                {serviziAttivi.length} servizi selezionati
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button size="lg" onClick={handleContinua} className="px-10 py-6">
              Continua → Disponibilità
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SetupProfessionista;
