import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { Info, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Servizio {
  id: string;
  nome: string;
  prezzo: number;
  prezzoConsigliato: number;
  attivo: boolean;
  dbId?: string;
}

const serviziInfermiere: Omit<Servizio, "id" | "attivo">[] = [
  { nome: "Iniezione intramuscolare", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Iniezione sottocutanea", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Iniezione endovenosa", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Prelievo ematico a domicilio", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Medicazione semplice", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Medicazione complessa", prezzo: 35, prezzoConsigliato: 35 },
  { nome: "Medicazione ferita chirurgica", prezzo: 30, prezzoConsigliato: 30 },
  { nome: "Medicazione ulcera da pressione", prezzo: 35, prezzoConsigliato: 35 },
  { nome: "Medicazione ulcera venosa", prezzo: 35, prezzoConsigliato: 35 },
  { nome: "Rimozione punti di sutura", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Rimozione graffette chirurgiche", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Cateterismo vescicale maschile", prezzo: 45, prezzoConsigliato: 45 },
  { nome: "Cateterismo vescicale femminile", prezzo: 40, prezzoConsigliato: 40 },
  { nome: "Gestione e sostituzione catetere vescicale", prezzo: 35, prezzoConsigliato: 35 },
  { nome: "Clistere evacuativo", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Infusione endovenosa (flebo)", prezzo: 40, prezzoConsigliato: 40 },
  { nome: "Terapia infusionale sottocutanea", prezzo: 35, prezzoConsigliato: 35 },
  { nome: "Somministrazione terapia intramuscolare", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Somministrazione terapia orale", prezzo: 12, prezzoConsigliato: 12 },
  { nome: "Somministrazione insulina", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Misurazione glicemia capillare", prezzo: 10, prezzoConsigliato: 10 },
  { nome: "Misurazione parametri vitali completa", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Misurazione pressione arteriosa", prezzo: 10, prezzoConsigliato: 10 },
  { nome: "ECG a domicilio", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Gestione stomie (colostomia, ileostomia, urostomia)", prezzo: 35, prezzoConsigliato: 35 },
  { nome: "Sostituzione sacca stomia", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Gestione nutrizione enterale (SNG/PEG)", prezzo: 40, prezzoConsigliato: 40 },
  { nome: "Gestione nutrizione parenterale", prezzo: 45, prezzoConsigliato: 45 },
  { nome: "Aspirazione tracheale", prezzo: 30, prezzoConsigliato: 30 },
  { nome: "Gestione tracheostomia", prezzo: 40, prezzoConsigliato: 40 },
  { nome: "Gestione drenaggi", prezzo: 30, prezzoConsigliato: 30 },
  { nome: "Bendaggio compressivo", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Bendaggio elastocompressivo arti inferiori", prezzo: 30, prezzoConsigliato: 30 },
  { nome: "Assistenza post-operatoria a domicilio", prezzo: 45, prezzoConsigliato: 45 },
  { nome: "Assistenza post-dimissione ospedaliera", prezzo: 40, prezzoConsigliato: 40 },
  { nome: "Educazione sanitaria al paziente e caregiver", prezzo: 30, prezzoConsigliato: 30 },
  { nome: "Educazione alla gestione del diabete", prezzo: 30, prezzoConsigliato: 30 },
  { nome: "Prelievo per test rapido (tampone, urine)", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Lavaggio auricolare", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Aerosolterapia a domicilio", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Ossigenoterapia domiciliare - avvio e monitoraggio", prezzo: 35, prezzoConsigliato: 35 },
  { nome: "Assistenza domiciliare continuativa (per ora)", prezzo: 30, prezzoConsigliato: 30 },
  { nome: "Assistenza infermieristica notturna (per ora)", prezzo: 35, prezzoConsigliato: 35 },
  { nome: "Assistenza infermieristica diurna (per ora)", prezzo: 30, prezzoConsigliato: 30 },
];

const serviziFisioterapista: Omit<Servizio, "id" | "attivo">[] = [
  { nome: "Riabilitazione motoria a domicilio", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Riabilitazione post-operatoria (protesi anca/ginocchio)", prezzo: 60, prezzoConsigliato: 60 },
  { nome: "Riabilitazione post-frattura", prezzo: 55, prezzoConsigliato: 55 },
  { nome: "Riabilitazione post-ictus", prezzo: 65, prezzoConsigliato: 65 },
  { nome: "Riabilitazione neurologica", prezzo: 65, prezzoConsigliato: 65 },
  { nome: "Riabilitazione respiratoria", prezzo: 55, prezzoConsigliato: 55 },
  { nome: "Riabilitazione pavimento pelvico", prezzo: 55, prezzoConsigliato: 55 },
  { nome: "Linfodrenaggio manuale", prezzo: 60, prezzoConsigliato: 60 },
  { nome: "Massoterapia decontratturante", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Terapia manuale ortopedica", prezzo: 55, prezzoConsigliato: 55 },
  { nome: "Ginnastica posturale a domicilio", prezzo: 45, prezzoConsigliato: 45 },
  { nome: "Ginnastica dolce per anziani", prezzo: 40, prezzoConsigliato: 40 },
  { nome: "Rieducazione alla deambulazione", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Mobilizzazione articolare", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Trattamento cervicalgia/lombalgia", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Kinesio taping", prezzo: 30, prezzoConsigliato: 30 },
  { nome: "Esercizio terapeutico personalizzato", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Stretching terapeutico", prezzo: 40, prezzoConsigliato: 40 },
];

const serviziOSS: Omit<Servizio, "id" | "attivo">[] = [
  { nome: "Igiene personale completa a letto", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Bagno assistito in vasca/doccia", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Vestizione e svestizione assistita", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Cambio pannolone e igiene intima", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Mobilizzazione e cambio postura a letto", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Trasferimento letto-carrozzina/poltrona", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Assistenza alla deambulazione", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Assistenza ai pasti e imboccamento", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Preparazione pasti a domicilio", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Compagnia e sorveglianza diurna (per ora)", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Sorveglianza notturna (per ora)", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Accompagnamento a visite mediche", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Accompagnamento a passeggiate", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Piccola spesa e commissioni", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Stimolazione cognitiva e attività ricreative", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Supporto nella gestione della casa leggera", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Assistenza continuativa diurna (per ora)", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Assistenza continuativa notturna (per ora)", prezzo: 22, prezzoConsigliato: 22 },
];

function getServiziPerTipo(tipo?: string): Omit<Servizio, "id" | "attivo">[] {
  switch (tipo) {
    case "fisioterapista": return serviziFisioterapista;
    case "oss": return serviziOSS;
    case "infermiere":
    default: return serviziInfermiere;
  }
}

function getTitoloRuolo(tipo?: string): string {
  switch (tipo) {
    case "fisioterapista": return "Fisioterapista";
    case "oss": return "OSS";
    default: return "Infermiere";
  }
}

const SetupProfessionista = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const tipo = profile?.professional_type;
  const serviziBase = getServiziPerTipo(tipo);

  const [servizi, setServizi] = useState<Servizio[]>(
    serviziBase.map((s, i) => ({ ...s, id: `srv-${i}`, attivo: false }))
  );
  const [loadingData, setLoadingData] = useState(true);
  const [isFirstSetup, setIsFirstSetup] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing services from DB
  useEffect(() => {
    const loadServices = async () => {
      if (!profile) return;
      const { data: savedServices } = await supabase
        .from("services")
        .select("*")
        .eq("professional_id", profile.id);

      if (savedServices && savedServices.length > 0) {
        setIsFirstSetup(false);
        setServizi((prev) =>
          prev.map((s) => {
            const saved = savedServices.find((ss) => ss.name === s.nome);
            if (saved) {
              return { ...s, attivo: true, prezzo: saved.price, dbId: saved.id };
            }
            return s;
          })
        );
      }
      setLoadingData(false);
    };
    loadServices();
  }, [profile]);

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

  const clampPrezzo = (id: string) => {
    setServizi((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const min = Math.round(s.prezzoConsigliato * 0.7);
        const max = Math.round(s.prezzoConsigliato * 1.3);
        const clamped = Math.min(max, Math.max(min, s.prezzo));
        return { ...s, prezzo: clamped };
      })
    );
  };

  const serviziAttivi = servizi.filter((s) => s.attivo);

  const handleSalva = async () => {
    if (!profile) return;
    if (serviziAttivi.length === 0) {
      toast({
        title: "Seleziona almeno un servizio",
        description: "Devi attivare almeno un servizio per continuare.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);

    // Delete all existing services for this professional then re-insert active ones
    await supabase.from("services").delete().eq("professional_id", profile.id);
    
    const toInsert = serviziAttivi.map((s) => ({
      professional_id: profile.id,
      name: s.nome,
      price: s.prezzo,
    }));
    const { error } = await supabase.from("services").insert(toInsert);
    setSaving(false);

    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Servizi salvati" });
      if (isFirstSetup) {
        navigate("/setup-professionista/disponibilita");
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
      <main className="flex-1 bg-background py-6 md:py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard-professionista")}
            className="mb-4 text-senior-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Torna indietro
          </Button>

          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm md:text-base">1</div>
              <h1 className="text-lg md:text-senior-2xl font-bold">I tuoi servizi — {getTitoloRuolo(tipo)}</h1>
            </div>
            <p className="text-base md:text-senior-base text-muted-foreground ml-11 md:ml-[52px]">
              Seleziona i servizi che offri e imposta i tuoi prezzi.
            </p>
          </div>

          <Card className="mb-6 md:mb-8">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-senior-lg">Servizi disponibili</CardTitle>
              <CardDescription className="text-sm md:text-senior-sm">
                Attiva i servizi che desideri offrire e personalizza il prezzo.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              {(() => {
                const sorted = [...servizi].sort((a, b) => {
                  if (a.attivo && !b.attivo) return -1;
                  if (!a.attivo && b.attivo) return 1;
                  return 0;
                });
                const attivi = sorted.filter(s => s.attivo);
                const nonAttivi = sorted.filter(s => !s.attivo);
                const renderServizio = (servizio: typeof servizi[0]) => {
                  const min = Math.round(servizio.prezzoConsigliato * 0.7);
                  const max = Math.round(servizio.prezzoConsigliato * 1.3);
                  return (
                    <div
                      key={servizio.id}
                      className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg border transition-colors ${
                        servizio.attivo ? "border-primary bg-secondary/50" : "border-border"
                      }`}
                    >
                      <Checkbox
                        checked={servizio.attivo}
                        onCheckedChange={() => toggleServizio(servizio.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-senior-sm font-medium truncate">{servizio.nome}</p>
                        {servizio.attivo && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Info className="w-3 h-3" />
                            Consigliato: €{servizio.prezzoConsigliato} (min €{min} — max €{max})
                          </p>
                        )}
                      </div>
                      {servizio.attivo && (
                        <div className="flex items-center gap-2">
                          <span className="text-senior-sm">€</span>
                          <Input
                            type="number"
                            min={min}
                            max={max}
                            value={servizio.prezzo}
                            onChange={(e) => updatePrezzo(servizio.id, Number(e.target.value))}
                            onBlur={() => clampPrezzo(servizio.id)}
                            className="w-20 text-center"
                          />
                        </div>
                      )}
                    </div>
                  );
                };
                return (
                  <div className="space-y-3">
                    {attivi.map(renderServizio)}
                    {attivi.length > 0 && nonAttivi.length > 0 && (
                      <div className="flex items-center gap-3 py-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-sm text-muted-foreground">Altri servizi disponibili</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    {nonAttivi.map(renderServizio)}
                  </div>
                );
              })()}
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
            <Button size="lg" onClick={handleSalva} className="px-10 py-6" disabled={saving}>
              {saving ? "Salvataggio..." : isFirstSetup ? "Salva e continua" : "Salva"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SetupProfessionista;
