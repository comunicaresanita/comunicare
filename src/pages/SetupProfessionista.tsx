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
  dbId?: string; // id from database if already saved
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
  { nome: "Valutazione fisioterapica iniziale", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Fisioterapia a domicilio (seduta)", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Riabilitazione motoria", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Riabilitazione post-operatoria (protesi anca/ginocchio)", prezzo: 55, prezzoConsigliato: 55 },
  { nome: "Riabilitazione post-frattura", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Riabilitazione post-ictus", prezzo: 60, prezzoConsigliato: 60 },
  { nome: "Riabilitazione neurologica", prezzo: 60, prezzoConsigliato: 60 },
  { nome: "Riabilitazione respiratoria", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Riabilitazione cardiologica", prezzo: 55, prezzoConsigliato: 55 },
  { nome: "Riabilitazione del pavimento pelvico", prezzo: 55, prezzoConsigliato: 55 },
  { nome: "Riabilitazione vestibolare (vertigini)", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Riabilitazione della spalla", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Riabilitazione della mano", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Riabilitazione del ginocchio", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Riabilitazione della colonna vertebrale", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Massoterapia decontratturante", prezzo: 45, prezzoConsigliato: 45 },
  { nome: "Massoterapia rilassante", prezzo: 40, prezzoConsigliato: 40 },
  { nome: "Linfodrenaggio manuale (metodo Vodder)", prezzo: 55, prezzoConsigliato: 55 },
  { nome: "Terapia manuale ortopedica", prezzo: 55, prezzoConsigliato: 55 },
  { nome: "Mobilizzazione articolare passiva", prezzo: 45, prezzoConsigliato: 45 },
  { nome: "Mobilizzazione articolare attiva assistita", prezzo: 45, prezzoConsigliato: 45 },
  { nome: "Ginnastica posturale", prezzo: 40, prezzoConsigliato: 40 },
  { nome: "Ginnastica dolce per anziani", prezzo: 35, prezzoConsigliato: 35 },
  { nome: "Rieducazione funzionale", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Rieducazione alla deambulazione", prezzo: 45, prezzoConsigliato: 45 },
  { nome: "Esercizio terapeutico personalizzato", prezzo: 45, prezzoConsigliato: 45 },
  { nome: "Stretching terapeutico", prezzo: 35, prezzoConsigliato: 35 },
  { nome: "Kinesio taping", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Trattamento trigger point", prezzo: 45, prezzoConsigliato: 45 },
  { nome: "Trattamento cervicalgia", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Trattamento lombalgia", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Trattamento sciatalgia", prezzo: 50, prezzoConsigliato: 50 },
  { nome: "Trattamento sindrome del tunnel carpale", prezzo: 45, prezzoConsigliato: 45 },
  { nome: "Elettrostimolazione muscolare (se con attrezzatura)", prezzo: 40, prezzoConsigliato: 40 },
  { nome: "TENS antalgica (se con attrezzatura)", prezzo: 35, prezzoConsigliato: 35 },
];

const serviziOSS: Omit<Servizio, "id" | "attivo">[] = [
  { nome: "Igiene personale completa a letto", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Igiene personale parziale (viso, mani, zona intima)", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Bagno assistito in vasca/doccia", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Shampoo e cura dei capelli a letto", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Cura delle unghie (mani e piedi)", prezzo: 12, prezzoConsigliato: 12 },
  { nome: "Rasatura e cura del viso", prezzo: 10, prezzoConsigliato: 10 },
  { nome: "Vestizione e svestizione assistita", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Cambio pannolone", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Cambio biancheria del letto con paziente allettato", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Mobilizzazione paziente a letto", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Posizionamento e riposizionamento (prevenzione decubiti)", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Trasferimento letto-carrozzina", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Trasferimento letto-poltrona", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Assistenza alla deambulazione", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Assistenza nell'uso di ausili (deambulatore, stampelle)", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Assistenza ai pasti (imboccamento)", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Preparazione pasti", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Somministrazione pasti frullati/omogeneizzati", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Idratazione assistita", prezzo: 12, prezzoConsigliato: 12 },
  { nome: "Compagnia e sorveglianza (per ora)", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Compagnia notturna (per ora)", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Supporto nelle attività quotidiane (per ora)", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Accompagnamento a visite mediche", prezzo: 25, prezzoConsigliato: 25 },
  { nome: "Accompagnamento a passeggiate", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Piccola spesa e commissioni", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Ritiro referti e ricette", prezzo: 12, prezzoConsigliato: 12 },
  { nome: "Gestione della casa leggera (riordino, pulizia stanza)", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Lavaggio e gestione biancheria", prezzo: 15, prezzoConsigliato: 15 },
  { nome: "Stimolazione cognitiva (giochi, lettura, conversazione)", prezzo: 20, prezzoConsigliato: 20 },
  { nome: "Sorveglianza paziente con demenza (per ora)", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Assistenza diurna continuativa (per ora)", prezzo: 18, prezzoConsigliato: 18 },
  { nome: "Assistenza notturna continuativa (per ora)", prezzo: 22, prezzoConsigliato: 22 },
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
      prev.map((s) => {
        if (s.id !== id) return s;
        const min = Math.round(s.prezzoConsigliato * 0.7);
        const max = Math.round(s.prezzoConsigliato * 1.3);
        const clampedPrezzo = Math.min(max, Math.max(min, prezzo));
        return { ...s, prezzo: clampedPrezzo };
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
      navigate("/setup-professionista/disponibilita");
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
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
              <h1 className="text-senior-2xl font-bold">I tuoi servizi — {getTitoloRuolo(tipo)}</h1>
            </div>
            <p className="text-senior-base text-muted-foreground ml-[52px]">
              Seleziona i servizi che offri e imposta i tuoi prezzi.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-senior-lg">Servizi disponibili</CardTitle>
              <CardDescription className="text-senior-sm">
                Attiva i servizi che desideri offrire e personalizza il prezzo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...servizi].sort((a, b) => {
                  if (a.attivo && !b.attivo) return -1;
                  if (!a.attivo && b.attivo) return 1;
                  return 0;
                }).map((servizio) => {
                  const min = Math.round(servizio.prezzoConsigliato * 0.7);
                  const max = Math.round(servizio.prezzoConsigliato * 1.3);
                  return (
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
                            className="w-20 text-center"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
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
            <Button size="lg" onClick={handleSalva} className="px-10 py-6" disabled={saving}>
              {saving ? "Salvataggio..." : "Salva e continua → disponibilità"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SetupProfessionista;
