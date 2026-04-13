import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { Calendar, Clock, ArrowLeft, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const giorniSettimana = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const weekdayToDayName: Record<number, string> = {
  0: "Domenica", 1: "Lunedì", 2: "Martedì", 3: "Mercoledì",
  4: "Giovedì", 5: "Venerdì", 6: "Sabato",
};
const monthNames = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

const oreDisponibili = Array.from({ length: 16 }, (_, i) => i + 7); // 7-22

interface WeeklySlot {
  giorno: string;
  ora: number;
}

interface OverrideSlot {
  date: string; // YYYY-MM-DD
  ora: number;
  isUnavailable: boolean;
}

const SetupDisponibilita = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFirstSetup, setIsFirstSetup] = useState(true);

  // Weekly recurring slots
  const [weeklySlots, setWeeklySlots] = useState<WeeklySlot[]>([]);
  // Specific date overrides
  const [overrides, setOverrides] = useState<OverrideSlot[]>([]);

  // Calendar state
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"weekly" | "calendar">("weekly");

  useEffect(() => {
    const load = async () => {
      if (!profile) return;
      const [availRes, overrideRes] = await Promise.all([
        supabase.from("availability").select("*").eq("professional_id", profile.id),
        supabase.from("availability_overrides").select("*").eq("professional_id", profile.id),
      ]);

      if (availRes.data && availRes.data.length > 0) {
        setIsFirstSetup(false);
        const slots: WeeklySlot[] = [];
        availRes.data.forEach(a => {
          const startH = parseInt(a.start_time.substring(0, 2));
          slots.push({ giorno: a.day_of_week, ora: startH });
        });
        setWeeklySlots(slots);
      }

      if (overrideRes.data && overrideRes.data.length > 0) {
        setIsFirstSetup(false);
        setOverrides(overrideRes.data.map(o => ({
          date: o.specific_date,
          ora: parseInt(o.start_time.substring(0, 2)),
          isUnavailable: o.is_unavailable,
        })));
      }

      setLoadingData(false);
    };
    load();
  }, [profile]);

  // Weekly slot toggling
  const toggleWeeklySlot = (giorno: string, ora: number) => {
    const exists = weeklySlots.some(s => s.giorno === giorno && s.ora === ora);
    if (exists) {
      setWeeklySlots(prev => prev.filter(s => !(s.giorno === giorno && s.ora === ora)));
    } else {
      setWeeklySlots(prev => [...prev, { giorno, ora }]);
    }
  };

  const isWeeklySlotActive = (giorno: string, ora: number) =>
    weeklySlots.some(s => s.giorno === giorno && s.ora === ora);

  // Calendar helpers
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const canGoPrev = calendarYear > today.getFullYear() || (calendarYear === today.getFullYear() && calendarMonth > today.getMonth());

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  };

  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Get effective slots for a specific date (weekly + overrides)
  const getEffectiveSlotsForDate = (date: Date) => {
    const dayName = weekdayToDayName[date.getDay()];
    const dateStr = formatDateStr(date);
    const dateOverrides = overrides.filter(o => o.date === dateStr);

    const effectiveSlots: { ora: number; isOverride: boolean; isUnavailable: boolean }[] = [];

    oreDisponibili.forEach(ora => {
      const override = dateOverrides.find(o => o.ora === ora);
      if (override) {
        if (!override.isUnavailable) {
          effectiveSlots.push({ ora, isOverride: true, isUnavailable: false });
        }
        // if unavailable override, skip
      } else if (weeklySlots.some(s => s.giorno === dayName && s.ora === ora)) {
        effectiveSlots.push({ ora, isOverride: false, isUnavailable: false });
      }
    });

    return effectiveSlots;
  };

  const toggleOverrideSlot = (date: Date, ora: number) => {
    const dateStr = formatDateStr(date);
    const dayName = weekdayToDayName[date.getDay()];
    const isWeekly = weeklySlots.some(s => s.giorno === dayName && s.ora === ora);
    const existingOverride = overrides.find(o => o.date === dateStr && o.ora === ora);

    if (existingOverride) {
      // Remove override
      setOverrides(prev => prev.filter(o => !(o.date === dateStr && o.ora === ora)));
    } else if (isWeekly) {
      // Add unavailable override (remove from this specific date)
      setOverrides(prev => [...prev, { date: dateStr, ora, isUnavailable: true }]);
    } else {
      // Add available override (add to this specific date)
      setOverrides(prev => [...prev, { date: dateStr, ora, isUnavailable: false }]);
    }
  };

  const isDateHasSlots = (day: number) => {
    const date = new Date(calendarYear, calendarMonth, day);
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return false;
    return getEffectiveSlotsForDate(date).length > 0;
  };

  const isDateHasOverrides = (day: number) => {
    const date = new Date(calendarYear, calendarMonth, day);
    const dateStr = formatDateStr(date);
    return overrides.some(o => o.date === dateStr);
  };

  const handleDateClick = (day: number) => {
    const date = new Date(calendarYear, calendarMonth, day);
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
    setSelectedDate(date);
  };

  const selectedDateStr = selectedDate ? formatDateStr(selectedDate) : null;
  const selectedDayName = selectedDate ? weekdayToDayName[selectedDate.getDay()] : null;

  const handleSalva = async () => {
    if (!profile) return;
    if (weeklySlots.length === 0 && overrides.filter(o => !o.isUnavailable).length === 0) {
      toast({ title: "Aggiungi disponibilità", description: "Inserisci almeno uno slot.", variant: "destructive" });
      return;
    }
    setSaving(true);

    // Save weekly availability
    await supabase.from("availability").delete().eq("professional_id", profile.id);
    if (weeklySlots.length > 0) {
      const toInsert = weeklySlots.map(s => ({
        professional_id: profile.id,
        day_of_week: s.giorno,
        start_time: `${String(s.ora).padStart(2, "0")}:00`,
        end_time: `${String(s.ora + 1).padStart(2, "0")}:00`,
      }));
      await supabase.from("availability").insert(toInsert);
    }

    // Save overrides
    await supabase.from("availability_overrides").delete().eq("professional_id", profile.id);
    if (overrides.length > 0) {
      const toInsert = overrides.map(o => ({
        professional_id: profile.id,
        specific_date: o.date,
        start_time: `${String(o.ora).padStart(2, "0")}:00`,
        end_time: `${String(o.ora + 1).padStart(2, "0")}:00`,
        is_unavailable: o.isUnavailable,
      }));
      await supabase.from("availability_overrides").insert(toInsert);
    }

    setSaving(false);
    toast({ title: "Disponibilità salvata" });
    if (isFirstSetup) navigate("/dashboard-professionista");
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
      <main className="flex-1 bg-background py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate("/dashboard-professionista")} className="mb-4 text-senior-sm gap-2">
            <ArrowLeft className="w-4 h-4" /> Torna indietro
          </Button>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
              <h1 className="text-xl md:text-senior-2xl font-bold">Disponibilità</h1>
            </div>
            <p className="text-sm md:text-senior-base text-muted-foreground ml-[52px]">
              Imposta la tua disponibilità settimanale ricorrente e personalizza giorni specifici.
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={viewMode === "weekly" ? "default" : "outline"}
              onClick={() => setViewMode("weekly")}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" /> Orari settimanali
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              className="gap-2"
            >
              <Clock className="w-4 h-4" /> Personalizza giorni
            </Button>
          </div>

          {viewMode === "weekly" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base md:text-senior-lg">Orari settimanali ricorrenti</CardTitle>
                <CardDescription className="text-sm">
                  Clicca sulle caselle per attivare/disattivare gli slot orari. Valgono per tutte le settimane.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs md:text-sm">
                    <thead>
                      <tr>
                        <th className="text-left p-1 md:p-2 font-medium text-muted-foreground sticky left-0 bg-background z-10">Ora</th>
                        {giorniSettimana.map(g => (
                          <th key={g} className="text-center p-1 md:p-2 font-medium text-muted-foreground min-w-[40px] md:min-w-[60px]">
                            <span className="hidden md:inline">{g}</span>
                            <span className="md:hidden">{g.substring(0, 3)}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {oreDisponibili.map(ora => (
                        <tr key={ora}>
                          <td className="p-1 md:p-2 font-mono text-muted-foreground sticky left-0 bg-background z-10 whitespace-nowrap">
                            {ora}-{ora + 1}
                          </td>
                          {giorniSettimana.map(g => {
                            const active = isWeeklySlotActive(g, ora);
                            return (
                              <td key={g} className="p-0.5 md:p-1 text-center">
                                <button
                                  onClick={() => toggleWeeklySlot(g, ora)}
                                  className={`w-full aspect-square md:aspect-auto md:h-8 rounded transition-colors ${
                                    active
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-secondary hover:bg-secondary/80"
                                  }`}
                                >
                                  {active && <span className="hidden md:inline text-xs">✓</span>}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {weeklySlots.length} slot settimanali selezionati
                </p>
              </CardContent>
            </Card>
          )}

          {viewMode === "calendar" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base md:text-senior-lg">Personalizza giorni specifici</CardTitle>
                <CardDescription className="text-sm">
                  Seleziona un giorno dal calendario per aggiungere o rimuovere slot specifici per quella data.
                </CardDescription>
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
                  {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(calendarYear, calendarMonth, day);
                    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const hasSlots = isDateHasSlots(day);
                    const hasOverrides = isDateHasOverrides(day);
                    const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === calendarMonth && selectedDate?.getFullYear() === calendarYear;
                    const isToday = day === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        disabled={isPast}
                        className={`aspect-square flex flex-col items-center justify-center rounded-md text-sm transition-colors relative
                          ${isSelected ? "bg-primary text-primary-foreground font-bold" : ""}
                          ${!isSelected && !isPast ? "hover:bg-secondary cursor-pointer" : ""}
                          ${isPast ? "text-muted-foreground/40 cursor-default" : ""}
                          ${isToday && !isSelected ? "border border-primary" : ""}
                          ${hasSlots && !isSelected ? "font-medium" : ""}
                        `}
                      >
                        {day}
                        {hasSlots && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary absolute bottom-1" />
                        )}
                        {hasOverrides && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 absolute bottom-1 ml-3" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Slot editing for selected date */}
                {selectedDate && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-3">
                      {weekdayToDayName[selectedDate.getDay()]} {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Clicca sugli orari per aggiungere o rimuovere slot per questa data specifica. Le modifiche sovrascrivono l'orario settimanale.
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                      {oreDisponibili.map(ora => {
                        const dateStr = formatDateStr(selectedDate);
                        const dayName = weekdayToDayName[selectedDate.getDay()];
                        const isWeekly = weeklySlots.some(s => s.giorno === dayName && s.ora === ora);
                        const override = overrides.find(o => o.date === dateStr && o.ora === ora);

                        let status: "active" | "inactive" | "override-add" | "override-remove" = "inactive";
                        if (override) {
                          status = override.isUnavailable ? "override-remove" : "override-add";
                        } else if (isWeekly) {
                          status = "active";
                        }

                        return (
                          <button
                            key={ora}
                            onClick={() => toggleOverrideSlot(selectedDate, ora)}
                            className={`py-2 rounded text-xs font-mono transition-colors ${
                              status === "active" ? "bg-primary text-primary-foreground" :
                              status === "override-add" ? "bg-green-500 text-white" :
                              status === "override-remove" ? "bg-red-200 text-red-700 line-through" :
                              "bg-secondary hover:bg-secondary/80"
                            }`}
                          >
                            {ora}-{ora + 1}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary inline-block" /> Settimanale</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Aggiunto</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 inline-block" /> Rimosso</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button size="lg" onClick={handleSalva} className="px-10 py-6" disabled={saving}>
              {saving ? "Salvataggio..." : "Salva"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SetupDisponibilita;
