import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { MapPin, Star, Calendar, Clock, ArrowLeft, BadgeCheck, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProfessionalProfile {
  id: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  zona: string | null;
  numero_opi: string | null;
  numero_fnofi: string | null;
  professional_type: string | null;
  photo_url: string | null;
  verified: boolean;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

interface Availability {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface Review {
  id: string;
  rating: number;
  text: string | null;
  created_at: string;
  patient_id: string;
  patient_name?: string;
}

const dayOrder: Record<string, number> = {
  "Lunedì": 1, "Martedì": 2, "Mercoledì": 3, "Giovedì": 4,
  "Venerdì": 5, "Sabato": 6, "Domenica": 7,
};

const ProfiloInfermiere = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile: userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [professional, setProfessional] = useState<ProfessionalProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const servizioFromQuery = searchParams.get("servizio");
  const [servizioSelezionato, setServizioSelezionato] = useState<string | null>(servizioFromQuery);
  const [slotSelezionato, setSlotSelezionato] = useState<string | null>(null);
  const [giornoSelezionato, setGiornoSelezionato] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      const [profileRes, servicesRes, availRes, reviewsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("services").select("*").eq("professional_id", id),
        supabase.from("availability").select("*").eq("professional_id", id),
        supabase.from("reviews").select("*").eq("professional_id", id).order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) setProfessional(profileRes.data as ProfessionalProfile);
      if (servicesRes.data) setServices(servicesRes.data);
      if (availRes.data) setAvailability(availRes.data);

      if (reviewsRes.data && reviewsRes.data.length > 0) {
        const patientIds = [...new Set(reviewsRes.data.map(r => r.patient_id))];
        const { data: patients } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", patientIds);

        const patientMap = new Map(
          (patients || []).map(p => [p.id, `${p.first_name} ${p.last_name?.charAt(0)}.`])
        );

        setReviews(reviewsRes.data.map(r => ({
          ...r,
          patient_name: patientMap.get(r.patient_id) || "Utente",
        })));
      }

      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!professional) {
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

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const selectedService = services.find(s => s.name === servizioSelezionato);

  const typeLabel = professional.professional_type === "oss" ? "OSS"
    : professional.professional_type === "fisioterapista" ? "Fisioterapista"
    : "Infermiere";

  const registrationNumber = professional.professional_type === "fisioterapista"
    ? professional.numero_fnofi : professional.numero_opi;

  const registrationLabel = professional.professional_type === "fisioterapista" ? "FNOFI" : "OPI";

  // Group availability by day
  const availByDay = availability.reduce<Record<string, string[]>>((acc, a) => {
    if (!acc[a.day_of_week]) acc[a.day_of_week] = [];
    acc[a.day_of_week].push(`${a.start_time.slice(0, 5)}-${a.end_time.slice(0, 5)}`);
    return acc;
  }, {});

  const sortedDays = Object.keys(availByDay).sort((a, b) => (dayOrder[a] || 99) - (dayOrder[b] || 99));

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
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          patient_id: userProfile?.id!,
          professional_id: professional.id,
          service_name: servizioSelezionato,
          price: selectedService?.price || 0,
          day: giornoSelezionato,
          time_slot: slotSelezionato,
          status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          bookingId: booking.id,
          serviceName: servizioSelezionato,
          price: selectedService?.price || 0,
          professionalName: `${professional.first_name} ${professional.last_name}`,
        },
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Errore", description: err.message || "Errore durante il pagamento.", variant: "destructive" });
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Oggi";
    if (days === 1) return "Ieri";
    if (days < 7) return `${days} giorni fa`;
    if (days < 30) return `${Math.floor(days / 7)} settimane fa`;
    return `${Math.floor(days / 30)} mesi fa`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 bg-background py-6 md:py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Button variant="ghost" onClick={() => navigate("/dashboard-paziente")} className="mb-4 md:mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" /> Torna alla ricerca
          </Button>

          {/* Profilo */}
          <Card className="mb-6 md:mb-8">
            <CardContent className="p-4 md:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-2xl md:text-senior-3xl flex-shrink-0 overflow-hidden">
                  {professional.photo_url ? (
                    <img src={professional.photo_url} alt={professional.first_name} className="w-full h-full object-cover" />
                  ) : (
                    professional.first_name[0]
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl md:text-senior-2xl font-bold flex items-center gap-2 flex-wrap">
                    {professional.first_name} {professional.last_name}
                    {professional.verified && <BadgeCheck className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />}
                  </h1>
                  <span className="text-xs font-medium text-primary bg-secondary px-2 py-0.5 rounded mt-1 inline-block">{typeLabel}</span>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {avgRating > 0 && (
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        {avgRating} ({reviews.length} recensioni)
                      </span>
                    )}
                    {professional.zona && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" /> {professional.zona}
                      </span>
                    )}
                  </div>
                  {registrationNumber && (
                    <p className="text-xs text-muted-foreground mt-1">{registrationLabel}: {registrationNumber}</p>
                  )}
                </div>
              </div>
              {professional.bio && <p className="text-sm md:text-senior-base text-muted-foreground">{professional.bio}</p>}
            </CardContent>
          </Card>

          {/* Servizi */}
          {services.length > 0 && (
            <Card className="mb-6 md:mb-8">
              <CardHeader>
                <CardTitle className="text-base md:text-senior-lg">Servizi e prezzi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {services.map(s => (
                    <button key={s.id} onClick={() => setServizioSelezionato(s.name)}
                      className={`w-full flex items-center justify-between p-3 md:p-4 rounded-lg border transition-colors text-left ${
                        servizioSelezionato === s.name ? "border-primary bg-secondary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm md:text-senior-sm font-medium">{s.name}</span>
                      <span className="text-base md:text-senior-base font-bold text-primary">€{s.price}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disponibilità */}
          {sortedDays.length > 0 && (
            <Card className="mb-6 md:mb-8">
              <CardHeader>
                <CardTitle className="text-base md:text-senior-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Disponibilità
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedDays.map(day => (
                    <div key={day} className="border rounded-lg p-3 md:p-4">
                      <h4 className="text-sm md:text-senior-sm font-semibold mb-2">{day}</h4>
                      <div className="flex flex-wrap gap-2">
                        {availByDay[day].map(slot => (
                          <button key={`${day}-${slot}`}
                            onClick={() => { setGiornoSelezionato(day); setSlotSelezionato(slot); }}
                            className={`flex items-center gap-1 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm transition-colors ${
                              giornoSelezionato === day && slotSelezionato === slot
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
          )}

          {sortedDays.length === 0 && (
            <Card className="mb-6 md:mb-8">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Nessuna disponibilità impostata al momento.</p>
              </CardContent>
            </Card>
          )}

          {/* Riepilogo e pagamento */}
          {servizioSelezionato && slotSelezionato && (
            <Card className="mb-6 md:mb-8 border-primary border-2">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-base md:text-senior-lg font-semibold mb-3">Riepilogo prenotazione</h3>
                <div className="space-y-2 text-sm md:text-senior-sm mb-4">
                  <p><strong>Servizio:</strong> {servizioSelezionato}</p>
                  <p><strong>Giorno:</strong> {giornoSelezionato}</p>
                  <p><strong>Orario:</strong> {slotSelezionato}</p>
                  <p><strong>Prezzo:</strong> €{selectedService?.price}</p>
                </div>
                <Button size="lg" onClick={handlePrenota} className="w-full py-5 md:py-6" disabled={paymentLoading}>
                  {paymentLoading ? "Elaborazione pagamento..." : `Paga €${selectedService?.price} e prenota`}
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
              <CardTitle className="text-base md:text-senior-lg flex items-center gap-2">
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
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setReviewRating(star)}>
                        <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                  <Textarea placeholder="Racconta la tua esperienza..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} />
                  <Button onClick={handleSubmitReview}>Invia recensione</Button>
                </div>
              )}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm md:text-senior-sm font-medium">{r.patient_name}</span>
                        <span className="text-xs md:text-sm text-muted-foreground">{formatDate(r.created_at)}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      {r.text && <p className="text-sm md:text-senior-sm text-muted-foreground">{r.text}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nessuna recensione ancora.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfiloInfermiere;
