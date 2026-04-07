import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { MapPin, Star, Calendar, Clock, ArrowLeft, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Mock data - in production from DB
const infermieri: Record<string, any> = {
  "inf-1": {
    id: "inf-1", nome: "Maria Rossi",
    bio: "Infermiera con 15 anni di esperienza in assistenza domiciliare. Specializzata in wound care e gestione stomie.",
    zona: "Centro storico, Firenze", valutazione: 4.8, recensioni: 47, numero_opi: "FI-12345",
    servizi: [
      { nome: "Medicazione semplice", prezzo: 20 }, { nome: "Medicazione complessa", prezzo: 35 },
      { nome: "Iniezione intramuscolare", prezzo: 15 }, { nome: "Prelievo ematico a domicilio", prezzo: 25 },
      { nome: "Gestione stomie", prezzo: 35 },
    ],
    disponibilita: [
      { giorno: "Lunedì", slots: ["08:00-12:00", "14:00-18:00"] },
      { giorno: "Martedì", slots: ["08:00-12:00"] },
      { giorno: "Mercoledì", slots: ["14:00-18:00"] },
      { giorno: "Giovedì", slots: ["08:00-12:00", "14:00-18:00"] },
      { giorno: "Venerdì", slots: ["08:00-13:00"] },
    ],
    recensioniLista: [
      { autore: "Giuseppe M.", data: "2 settimane fa", voto: 5, testo: "Professionale e gentilissima." },
      { autore: "Anna L.", data: "1 mese fa", voto: 5, testo: "Puntuale e molto competente." },
      { autore: "Roberto P.", data: "1 mese fa", voto: 4, testo: "Ottima esperienza." },
    ],
  },
  "inf-2": {
    id: "inf-2", nome: "Luca Bianchi",
    bio: "Infermiere specializzato in terapie infusive e prelievi. 8 anni di esperienza.",
    zona: "Campo di Marte, Firenze", valutazione: 4.6, recensioni: 32, numero_opi: "FI-23456",
    servizi: [
      { nome: "Infusione endovenosa (flebo)", prezzo: 40 }, { nome: "Prelievo ematico a domicilio", prezzo: 22 },
      { nome: "Iniezione intramuscolare", prezzo: 14 }, { nome: "Iniezione sottocutanea", prezzo: 14 },
      { nome: "Cateterismo vescicale", prezzo: 38 },
    ],
    disponibilita: [
      { giorno: "Lunedì", slots: ["09:00-13:00"] },
      { giorno: "Mercoledì", slots: ["09:00-13:00", "15:00-19:00"] },
      { giorno: "Venerdì", slots: ["09:00-13:00"] },
      { giorno: "Sabato", slots: ["09:00-12:00"] },
    ],
    recensioniLista: [
      { autore: "Francesca T.", data: "1 settimana fa", voto: 5, testo: "Prelievo rapido e indolore." },
      { autore: "Marco B.", data: "3 settimane fa", voto: 4, testo: "Buona esperienza complessiva." },
    ],
  },
  "inf-3": {
    id: "inf-3", nome: "Giulia Verdi",
    bio: "Infermiera pediatrica con esperienza in assistenza domiciliare per pazienti anziani.",
    zona: "Rifredi, Firenze", valutazione: 4.9, recensioni: 61, numero_opi: "FI-34567",
    servizi: [
      { nome: "Assistenza post-operatoria", prezzo: 45 }, { nome: "Medicazione semplice", prezzo: 22 },
      { nome: "Misurazione parametri vitali", prezzo: 15 }, { nome: "Educazione sanitaria al paziente", prezzo: 28 },
      { nome: "Assistenza domiciliare continuativa", prezzo: 32 },
    ],
    disponibilita: [
      { giorno: "Lunedì", slots: ["07:00-12:00", "14:00-17:00"] },
      { giorno: "Martedì", slots: ["07:00-12:00", "14:00-17:00"] },
      { giorno: "Mercoledì", slots: ["07:00-12:00"] },
      { giorno: "Giovedì", slots: ["07:00-12:00", "14:00-17:00"] },
      { giorno: "Venerdì", slots: ["07:00-12:00", "14:00-17:00"] },
    ],
    recensioniLista: [
      { autore: "Lucia G.", data: "3 giorni fa", voto: 5, testo: "Eccezionale! Grande professionalità." },
      { autore: "Paolo R.", data: "2 settimane fa", voto: 5, testo: "La migliore infermiera." },
      { autore: "Carla S.", data: "1 mese fa", voto: 5, testo: "Fantastica, sempre puntuale." },
    ],
  },
  "inf-4": {
    id: "inf-4", nome: "Andrea Conti",
    bio: "Infermiere con specializzazione in ECG e parametri vitali.",
    zona: "Coverciano, Firenze", valutazione: 4.7, recensioni: 28, numero_opi: "FI-45678",
    servizi: [
      { nome: "ECG a domicilio", prezzo: 48 }, { nome: "Misurazione parametri vitali", prezzo: 15 },
      { nome: "Prelievo ematico a domicilio", prezzo: 25 }, { nome: "Iniezione intramuscolare", prezzo: 15 },
      { nome: "Bendaggio compressivo", prezzo: 25 },
    ],
    disponibilita: [
      { giorno: "Martedì", slots: ["10:00-14:00"] },
      { giorno: "Giovedì", slots: ["10:00-14:00", "16:00-19:00"] },
      { giorno: "Sabato", slots: ["09:00-13:00"] },
    ],
    recensioniLista: [
      { autore: "Stefano D.", data: "1 settimana fa", voto: 5, testo: "ECG a domicilio fatto in modo professionale." },
      { autore: "Rita M.", data: "1 mese fa", voto: 4, testo: "Bravo e puntuale." },
    ],
  },
};

const ProfiloInfermiere = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [servizioSelezionato, setServizioSelezionato] = useState<string | null>(null);
  const [slotSelezionato, setSlotSelezionato] = useState<string | null>(null);
  const [giornoSelezionato, setGiornoSelezionato] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const infermiere = id ? infermieri[id] : null;

  if (!infermiere) {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-senior-xl">Profilo non trovato</p>
            <Button onClick={() => navigate("/dashboard-paziente")} className="mt-4">Torna alla ricerca</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedService = infermiere.servizi.find((s: any) => s.nome === servizioSelezionato);

  const handlePrenota = async () => {
    if (!servizioSelezionato || !slotSelezionato || !giornoSelezionato) {
      toast({ title: "Seleziona tutti i campi", description: "Scegli un servizio, un giorno e uno slot orario.", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Accedi per prenotare", description: "Devi effettuare l'accesso per prenotare una prestazione.", variant: "destructive" });
      navigate("/login");
      return;
    }

    setPaymentLoading(true);

    try {
      // Create booking in DB
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          patient_id: profile?.id,
          professional_id: profile?.id, // In production, use actual professional profile ID
          service_name: servizioSelezionato,
          price: selectedService?.prezzo || 0,
          day: giornoSelezionato,
          time_slot: slotSelezionato,
          status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create Stripe payment session
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          bookingId: booking.id,
          serviceName: servizioSelezionato,
          price: selectedService?.prezzo || 0,
          professionalName: infermiere.nome,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: "Errore", description: err.message || "Si è verificato un errore durante il pagamento.", variant: "destructive" });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({ title: "Accedi per recensire", description: "Devi effettuare l'accesso.", variant: "destructive" });
      return;
    }
    toast({ title: "Recensione inviata", description: "Grazie per il tuo feedback!" });
    setShowReviewForm(false);
    setReviewText("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-3xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" /> Torna alla ricerca
          </Button>

          {/* Profilo */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-senior-3xl flex-shrink-0">
                  {infermiere.nome[0]}
                </div>
                <div className="flex-1">
                  <h1 className="text-senior-2xl font-bold flex items-center gap-2">
                    {infermiere.nome}
                    <BadgeCheck className="w-6 h-6 text-primary flex-shrink-0" />
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-senior-sm">
                      <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      {infermiere.valutazione} ({infermiere.recensioni} recensioni)
                    </span>
                    <span className="flex items-center gap-1 text-senior-sm text-muted-foreground">
                      <MapPin className="w-5 h-5" /> {infermiere.zona}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">OPI: {infermiere.numero_opi}</p>
                </div>
              </div>
              <p className="text-senior-base text-muted-foreground">{infermiere.bio}</p>
            </CardContent>
          </Card>

          {/* Servizi e prezzi */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-senior-lg">Servizi e prezzi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {infermiere.servizi.map((s: any) => (
                  <button key={s.nome} onClick={() => setServizioSelezionato(s.nome)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors text-left ${
                      servizioSelezionato === s.nome ? "border-primary bg-secondary" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-senior-sm font-medium">{s.nome}</span>
                    <span className="text-senior-base font-bold text-primary">€{s.prezzo}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disponibilità */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Disponibilità
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {infermiere.disponibilita.map((d: any) => (
                  <div key={d.giorno} className="border rounded-lg p-4">
                    <h4 className="text-senior-sm font-semibold mb-2">{d.giorno}</h4>
                    <div className="flex flex-wrap gap-2">
                      {d.slots.map((slot: string) => (
                        <button key={`${d.giorno}-${slot}`}
                          onClick={() => { setGiornoSelezionato(d.giorno); setSlotSelezionato(slot); }}
                          className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm transition-colors ${
                            giornoSelezionato === d.giorno && slotSelezionato === slot
                              ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
                          }`}
                        >
                          <Clock className="w-3 h-3" />{slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Riepilogo e pagamento */}
          {servizioSelezionato && slotSelezionato && (
            <Card className="mb-8 border-primary border-2">
              <CardContent className="p-6">
                <h3 className="text-senior-lg font-semibold mb-3">Riepilogo prenotazione</h3>
                <div className="space-y-2 text-senior-sm mb-4">
                  <p><strong>Servizio:</strong> {servizioSelezionato}</p>
                  <p><strong>Giorno:</strong> {giornoSelezionato}</p>
                  <p><strong>Orario:</strong> {slotSelezionato}</p>
                  <p><strong>Prezzo:</strong> €{selectedService?.prezzo}</p>
                </div>
                <Button size="lg" onClick={handlePrenota} className="w-full py-6" disabled={paymentLoading}>
                  {paymentLoading ? "Elaborazione pagamento..." : `Paga €${selectedService?.prezzo} e prenota`}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Il pagamento è sicuro tramite Stripe. Il professionista riceverà il compenso solo a prestazione completata.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recensioni */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-senior-lg flex items-center gap-2">
                <Star className="w-5 h-5" /> Recensioni
              </CardTitle>
              {user && (
                <Button variant="outline" size="sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                  Scrivi una recensione
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showReviewForm && (
                <div className="border rounded-lg p-4 mb-4 space-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setReviewRating(star)}>
                        <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                  <Textarea placeholder="Racconta la tua esperienza..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} />
                  <Button onClick={handleSubmitReview}>Invia recensione</Button>
                </div>
              )}
              <div className="space-y-4">
                {infermiere.recensioniLista.map((r: any, i: number) => (
                  <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-senior-sm font-medium">{r.autore}</span>
                      <span className="text-sm text-muted-foreground">{r.data}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: r.voto }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <p className="text-senior-sm text-muted-foreground">{r.testo}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfiloInfermiere;
