import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { MapPin, Star, Clock, ArrowLeft, BadgeCheck, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
}

const dayNameToWeekday: Record<string, number> = {
  "Domenica": 0, "Lunedì": 1, "Martedì": 2, "Mercoledì": 3,
  "Giovedì": 4, "Venerdì": 5, "Sabato": 6,
};

const weekdayToDayName: Record<number, string> = {
  0: "Domenica", 1: "Lunedì", 2: "Martedì", 3: "Mercoledì",
  4: "Giovedì", 5: "Venerdì", 6: "Sabato",
};

const monthNames = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slotSelezionato, setSlotSelezionato] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Calendar state
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  const [overrides, setOverrides] = useState<{ specific_date: string; start_time: string; end_time: string; is_unavailable: boolean }[]>([]);
  const [bookedSlots, setBookedSlots] = useState<{ day: string; time_slot: string }[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      const [profileRes, servicesRes, availRes, reviewsRes, overridesRes, bookingsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("services").select("*").eq("professional_id", id),
        supabase.from("availability").select("*").eq("professional_id", id),
        supabase.from("reviews").select("*").eq("professional_id", id).order("created_at", { ascending: false }),
        supabase.from("availability_overrides").select("*").eq("professional_id", id),
        supabase.from("bookings").select("day, time_slot").eq("professional_id", id).in("status", ["pending", "confirmed"]),
      ]);

      if (profileRes.data) setProfessional(profileRes.data as ProfessionalProfile);
      if (servicesRes.data) setServices(servicesRes.data);
      if (availRes.data) setAvailability(availRes.data);
      if (reviewsRes.data) setReviews(reviewsRes.data);
      if (overridesRes.data) setOverrides(overridesRes.data);
      if (bookingsRes.data) setBookedSlots(bookingsRes.data);

      setLoading(false);
    };
    fetchData();
  }, [id]);

  // Calendar helpers
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Get slots for a specific date (considering overrides)
  const getSlotsForDate = (date: Date) => {
    const dayName = weekdayToDayName[date.getDay()];
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const dateOverrides = overrides.filter(o => o.specific_date === dateStr);

    // Start with weekly slots
    const weeklySlots = availability
      .filter(a => a.day_of_week === dayName)
      .map(a => ({ start: a.start_time.slice(0, 5), end: a.end_time.slice(0, 5) }));

    // Apply overrides
    const result: string[] = [];
    const allHours = new Set<number>();

    // Add weekly hours
    weeklySlots.forEach(s => {
      const h = parseInt(s.start.substring(0, 2));
      allHours.add(h);
    });

    // Process overrides
    dateOverrides.forEach(o => {
      const h = parseInt(o.start_time.substring(0, 2));
      if (o.is_unavailable) {
        allHours.delete(h);
      } else {
        allHours.add(h);
      }
    });

    const sorted = Array.from(allHours).sort((a, b) => a - b);

    // Filter out booked slots
    const dayName = weekdayToDayName[date.getDay()];
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const formatDateLabel = (d: Date) => {
      const dn = weekdayToDayName[d.getDay()];
      return `${dn} ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    };
    const dayLabel = formatDateLabel(date);

    return sorted
      .map(h => `${h}-${h + 1}`)
      .filter(slot => !bookedSlots.some(b => b.day === dayLabel && b.time_slot === slot));
  };

  const isDateAvailable = (day: number) => {
    const date = new Date(calendarYear, calendarMonth, day);
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return false;
    return getSlotsForDate(date).length > 0;
  };

  const handleDateClick = (day: number) => {
    if (!isDateAvailable(day)) return;
    const date = new Date(calendarYear, calendarMonth, day);
    setSelectedDate(date);
    setSlotSelezionato(null);
  };

  
  const slotsForSelectedDay = selectedDate ? getSlotsForDate(selectedDate) : [];

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  };

  const canGoPrev = calendarYear > today.getFullYear() || (calendarYear === today.getFullYear() && calendarMonth > today.getMonth());

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

  const formatSelectedDate = (date: Date) => {
    const dayName = weekdayToDayName[date.getDay()];
    return `${dayName} ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handlePrenota = async () => {
    if (!servizioSelezionato || !slotSelezionato || !selectedDate) {
      toast({ title: "Seleziona tutti i campi", description: "Scegli un giorno e uno slot orario.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Accedi per prenotare", description: "Devi effettuare l'accesso per prenotare una prestazione.", variant: "destructive" });
      navigate("/login");
      return;
    }

    setPaymentLoading(true);
    try {
      const dayStr = formatSelectedDate(selectedDate);
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          patient_id: userProfile?.id!,
          professional_id: professional.id,
          service_name: servizioSelezionato,
          price: selectedService?.price || 0,
          day: dayStr,
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

          {/* Servizio selezionato (solo quello ricercato) */}
          {selectedService && (
            <Card className="mb-6 md:mb-8">
              <CardHeader>
                <CardTitle className="text-base md:text-senior-lg">Prestazione selezionata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 md:p-4 rounded-lg border border-primary bg-secondary">
                  <span className="text-sm md:text-senior-sm font-medium">{selectedService.name}</span>
                  <span className="text-base md:text-senior-base font-bold text-primary">€{selectedService.price}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calendario disponibilità */}
          <Card className="mb-6 md:mb-8">
            <CardHeader>
              <CardTitle className="text-base md:text-senior-lg">Scegli data e orario</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={prevMonth} disabled={!canGoPrev} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold">{monthNames[calendarMonth]} {calendarYear}</span>
                <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const available = isDateAvailable(day);
                  const isSelected = selectedDate &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === calendarMonth &&
                    selectedDate.getFullYear() === calendarYear;
                  const isToday = day === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      disabled={!available}
                      className={`aspect-square flex items-center justify-center rounded-md text-sm transition-colors
                        ${isSelected ? "bg-primary text-primary-foreground font-bold" : ""}
                        ${!isSelected && available ? "hover:bg-secondary cursor-pointer font-medium" : ""}
                        ${!available ? "text-muted-foreground/40 cursor-default" : ""}
                        ${isToday && !isSelected ? "border border-primary" : ""}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Time slots for selected date */}
              {selectedDate && slotsForSelectedDay.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">
                    Orari disponibili per {formatSelectedDate(selectedDate)}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slotsForSelectedDay.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSlotSelezionato(slot)}
                        className={`flex items-center gap-1 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm transition-colors ${
                          slotSelezionato === slot
                            ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        <Clock className="w-3 h-3" />{slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDate && slotsForSelectedDay.length === 0 && (
                <p className="mt-4 text-sm text-muted-foreground text-center">Nessuno slot disponibile per questa data.</p>
              )}

              {availability.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Nessuna disponibilità impostata al momento.</p>
              )}
            </CardContent>
          </Card>

          {/* Riepilogo e pagamento */}
          {servizioSelezionato && slotSelezionato && selectedDate && (
            <Card className="mb-6 md:mb-8 border-primary border-2">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-base md:text-senior-lg font-semibold mb-3">Riepilogo prenotazione</h3>
                <div className="space-y-2 text-sm md:text-senior-sm mb-4">
                  <p><strong>Servizio:</strong> {servizioSelezionato}</p>
                  <p><strong>Giorno:</strong> {formatSelectedDate(selectedDate)}</p>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfiloInfermiere;
