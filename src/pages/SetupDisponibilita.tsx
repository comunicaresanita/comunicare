import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { Calendar, Clock, Plus, Trash2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SlotDisponibilita {
  id: string;
  giorno: string;
  oraInizio: string;
  oraFine: string;
}

const giorniSettimana = [
  "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"
];

const SetupDisponibilita = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [slots, setSlots] = useState<SlotDisponibilita[]>([]);
  const [giorno, setGiorno] = useState("Lunedì");
  const [oraInizio, setOraInizio] = useState("08:00");
  const [oraFine, setOraFine] = useState("12:00");
  const [posizione, setPosizione] = useState<{ lat: number; lng: number } | null>(null);
  const [indirizzoMappa, setIndirizzoMappa] = useState("");

  const aggiungiSlot = () => {
    if (oraInizio >= oraFine) {
      toast({
        title: "Orario non valido",
        description: "L'ora di inizio deve essere precedente all'ora di fine.",
        variant: "destructive",
      });
      return;
    }
    const nuovo: SlotDisponibilita = {
      id: `slot-${Date.now()}`,
      giorno,
      oraInizio,
      oraFine,
    };
    setSlots((prev) => [...prev, nuovo]);
  };

  const rimuoviSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const slotPerGiorno = giorniSettimana.map((g) => ({
    giorno: g,
    slots: slots.filter((s) => s.giorno === g),
  }));

  const impostaPosizione = () => {
    // Simula geocoding - in produzione userebbe Google Maps Geocoding API
    if (!indirizzoMappa.trim()) {
      toast({
        title: "Inserisci un indirizzo",
        description: "Scrivi un indirizzo per posizionare il tuo segnalino sulla mappa.",
        variant: "destructive",
      });
      return;
    }
    // Centro di Firenze come default con leggera randomizzazione
    const lat = 43.7696 + (Math.random() - 0.5) * 0.02;
    const lng = 11.2558 + (Math.random() - 0.5) * 0.02;
    setPosizione({ lat, lng });
    toast({
      title: "Posizione impostata",
      description: `Il tuo segnalino è stato posizionato vicino a "${indirizzoMappa}".`,
    });
  };

  const handleCompleta = () => {
    if (slots.length === 0) {
      toast({
        title: "Aggiungi disponibilità",
        description: "Inserisci almeno uno slot di disponibilità.",
        variant: "destructive",
      });
      return;
    }
    if (!posizione) {
      toast({
        title: "Posizione mancante",
        description: "Imposta la tua posizione sulla mappa per continuare.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Setup completato!",
      description: "Il tuo profilo professionale è stato configurato con successo.",
    });
    navigate("/dashboard-professionista");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-3xl">
          {/* Step indicator */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
              <h1 className="text-senior-2xl font-bold">Disponibilità e Posizione</h1>
            </div>
            <p className="text-senior-base text-muted-foreground ml-[52px]">
              Imposta quando sei disponibile e dove i pazienti potranno trovarti sulla mappa.
            </p>
          </div>

          {/* Calendario disponibilità */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Calendario Disponibilità
              </CardTitle>
              <CardDescription className="text-senior-sm">
                Aggiungi gli slot orari in cui sei disponibile per le visite.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1">
                  <label className="text-senior-sm font-medium block mb-1">Giorno</label>
                  <select
                    value={giorno}
                    onChange={(e) => setGiorno(e.target.value)}
                    className="w-full border rounded-md p-2 text-senior-sm bg-background"
                  >
                    {giorniSettimana.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-senior-sm font-medium block mb-1">Dalle</label>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="time"
                      value={oraInizio}
                      onChange={(e) => setOraInizio(e.target.value)}
                      className="border rounded-md p-2 text-senior-sm bg-background"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-senior-sm font-medium block mb-1">Alle</label>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="time"
                      value={oraFine}
                      onChange={(e) => setOraFine(e.target.value)}
                      className="border rounded-md p-2 text-senior-sm bg-background"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={aggiungiSlot} className="gap-2">
                    <Plus className="w-4 h-4" /> Aggiungi
                  </Button>
                </div>
              </div>

              {/* Riepilogo settimanale */}
              <div className="space-y-3">
                {slotPerGiorno
                  .filter((g) => g.slots.length > 0)
                  .map((g) => (
                    <div key={g.giorno} className="border rounded-lg p-4">
                      <h4 className="text-senior-sm font-semibold text-primary mb-2">{g.giorno}</h4>
                      <div className="flex flex-wrap gap-2">
                        {g.slots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm"
                          >
                            <span>{slot.oraInizio} - {slot.oraFine}</span>
                            <button
                              onClick={() => rimuoviSlot(slot.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                {slots.length === 0 && (
                  <p className="text-senior-sm text-muted-foreground text-center py-8">
                    Nessuno slot aggiunto. Aggiungi i tuoi orari di disponibilità.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Posizione sulla mappa */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" /> La Tua Posizione sulla Mappa
              </CardTitle>
              <CardDescription className="text-senior-sm">
                Inserisci un indirizzo di riferimento. Questo sarà il punto che i pazienti vedranno sulla mappa.
                Puoi scegliere casa tua, il tuo luogo di lavoro, o qualsiasi punto che ti sia comodo — così non devi condividere la tua posizione esatta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={indirizzoMappa}
                    onChange={(e) => setIndirizzoMappa(e.target.value)}
                    placeholder="Es. Piazza della Signoria, Firenze"
                    className="w-full border rounded-md p-3 text-senior-sm bg-background"
                  />
                </div>
                <Button onClick={impostaPosizione} className="gap-2">
                  <MapPin className="w-4 h-4" /> Imposta Posizione
                </Button>
              </div>

              {/* Mappa placeholder */}
              <div className="relative w-full h-72 bg-secondary rounded-lg overflow-hidden border">
                {posizione ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="bg-card p-6 rounded-lg shadow-md text-center">
                      <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
                      <p className="text-senior-sm font-medium">Posizione impostata</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {indirizzoMappa}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lat: {posizione.lat.toFixed(4)}, Lng: {posizione.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                      <p className="text-senior-sm text-muted-foreground">
                        La mappa apparirà dopo aver impostato la posizione
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        (Integrazione Google Maps in fase di sviluppo)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/setup-professionista")}
              className="text-senior-sm"
            >
              ← Torna ai Servizi
            </Button>
            <Button size="lg" onClick={handleCompleta} className="px-10 py-6">
              Completa Setup ✓
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SetupDisponibilita;
