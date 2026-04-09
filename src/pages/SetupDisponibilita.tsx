import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { Calendar, Clock, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SlotDisponibilita {
  id: string;
  giorno: string;
  oraInizio: string;
  oraFine: string;
  dbId?: string;
}

const giorniSettimana = [
  "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"
];

const SetupDisponibilita = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [slots, setSlots] = useState<SlotDisponibilita[]>([]);
  const [giorno, setGiorno] = useState("Lunedì");
  const [oraInizio, setOraInizio] = useState("08:00");
  const [oraFine, setOraFine] = useState("12:00");
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFirstSetup, setIsFirstSetup] = useState(true);

  // Load existing availability from DB
  useEffect(() => {
    const loadAvailability = async () => {
      if (!profile) return;
      const { data } = await supabase
        .from("availability")
        .select("*")
        .eq("professional_id", profile.id);

      if (data && data.length > 0) {
        setIsFirstSetup(false);
        setSlots(data.map((a) => ({
          id: `slot-${a.id}`,
          giorno: a.day_of_week,
          oraInizio: a.start_time.substring(0, 5),
          oraFine: a.end_time.substring(0, 5),
          dbId: a.id,
        })));
      }
      setLoadingData(false);
    };
    loadAvailability();
  }, [profile]);

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

  const handleCompleta = async () => {
    if (!profile) return;
    if (slots.length === 0) {
      toast({
        title: "Aggiungi disponibilità",
        description: "Inserisci almeno uno slot di disponibilità.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);

    // Delete all existing availability and re-insert
    await supabase.from("availability").delete().eq("professional_id", profile.id);
    
    const toInsert = slots.map((s) => ({
      professional_id: profile.id,
      day_of_week: s.giorno,
      start_time: s.oraInizio,
      end_time: s.oraFine,
    }));
    const { error } = await supabase.from("availability").insert(toInsert);
    setSaving(false);

    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Disponibilità salvata" });
      if (isFirstSetup) {
        navigate("/dashboard-professionista");
      }
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard-professionista")}
            className="mb-4 text-senior-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Torna indietro
          </Button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
              <h1 className="text-senior-2xl font-bold">Disponibilità</h1>
            </div>
            <p className="text-senior-base text-muted-foreground ml-[52px]">
              Imposta quando sei disponibile per le visite a domicilio.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Calendario disponibilità
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

          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/setup-professionista")}
              className="text-senior-sm"
            >
              ← Torna ai servizi
            </Button>
            <Button size="lg" onClick={handleCompleta} className="px-10 py-6" disabled={saving}>
              {saving ? "Salvataggio..." : "Salva disponibilità ✓"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SetupDisponibilita;
