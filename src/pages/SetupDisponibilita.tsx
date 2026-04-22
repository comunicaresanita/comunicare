import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const monthNames = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

const oreDisponibili = Array.from({ length: 16 }, (_, i) => i + 7); // 7-22

interface DaySlot {
  date: string; // YYYY-MM-DD
  ora: number;
}

const SetupDisponibilita = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFirstSetup, setIsFirstSetup] = useState(true);

  // All availability slots stored per specific date
  const [slots, setSlots] = useState<DaySlot[]>([]);

  // Calendar state
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    const load = async () => {
      if (!profile) return;

      // Load from availability_overrides (now the only source)
      const { data } = await supabase
        .from("availability_overrides")
        .select("*")
        .eq("professional_id", profile.id)
        .eq("is_unavailable", false);

      if (data && data.length > 0) {
        setIsFirstSetup(false);
        setSlots(
          data.map((o) => ({
            date: o.specific_date,
            ora: parseInt(o.start_time.substring(0, 2)),
          }))
        );
      }

      // Also check old weekly availability to detect first setup
      const { data: weeklyData } = await supabase
        .from("availability")
        .select("id")
        .eq("professional_id", profile.id)
        .limit(1);

      if (weeklyData && weeklyData.length > 0) {
        setIsFirstSetup(false);
      }

      setLoadingData(false);
    };
    load();
  }, [profile]);

  // Calendar helpers
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const canGoPrev =
    calendarYear > today.getFullYear() ||
    (calendarYear === today.getFullYear() && calendarMonth > today.getMonth());

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const getSlotsForDate = (dateStr: string) =>
    slots.filter((s) => s.date === dateStr);

  const isDateHasSlots = (day: number) => {
    const date = new Date(calendarYear, calendarMonth, day);
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return false;
    const dateStr = formatDateStr(date);
    return getSlotsForDate(dateStr).length > 0;
  };

  const handleDateClick = (day: number) => {
    const date = new Date(calendarYear, calendarMonth, day);
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
    setSelectedDate(date);
  };

  const toggleSlot = (date: Date, ora: number) => {
    const dateStr = formatDateStr(date);
    const exists = slots.some((s) => s.date === dateStr && s.ora === ora);
    if (exists) {
      setSlots((prev) => prev.filter((s) => !(s.date === dateStr && s.ora === ora)));
    } else {
      setSlots((prev) => [...prev, { date: dateStr, ora }]);
    }
  };

  const handleSalva = async () => {
    if (!profile) return;
    setSaving(true);

    // Clear old weekly availability
    await supabase.from("availability").delete().eq("professional_id", profile.id);

    // Clear old overrides and save new ones
    await supabase.from("availability_overrides").delete().eq("professional_id", profile.id);

    if (slots.length > 0) {
      const toInsert = slots.map((s) => ({
        professional_id: profile.id,
        specific_date: s.date,
        start_time: `${String(s.ora).padStart(2, "0")}:00`,
        end_time: `${String(s.ora + 1).padStart(2, "0")}:00`,
        is_unavailable: false,
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

  const isToday = (day: number) =>
    day === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();

  const isSelected = (day: number) =>
    selectedDate?.getDate() === day &&
    selectedDate?.getMonth() === calendarMonth &&
    selectedDate?.getFullYear() === calendarYear;

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
              Seleziona i giorni dal calendario e imposta gli orari in cui sei disponibile.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base md:text-senior-lg">Calendario disponibilità</CardTitle>
              <CardDescription className="text-sm">
                Clicca su un giorno per impostare gli orari di disponibilità. Di default non sei disponibile: aggiungi tu gli slot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={prevMonth} disabled={!canGoPrev} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold">
                  {monthNames[calendarMonth]} {calendarYear}
                </span>
                <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`e-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(calendarYear, calendarMonth, day);
                  const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const hasSlots = isDateHasSlots(day);
                  const sel = isSelected(day);
                  const tod = isToday(day);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      disabled={isPast}
                      className={`aspect-square flex flex-col items-center justify-center rounded-md text-sm transition-colors relative
                        ${sel ? "bg-primary text-primary-foreground font-bold" : ""}
                        ${!sel && !isPast ? "hover:bg-secondary cursor-pointer" : ""}
                        ${isPast ? "text-muted-foreground/40 cursor-default" : ""}
                        ${tod && !sel ? "border border-primary" : ""}
                        ${hasSlots && !sel ? "font-medium" : ""}
                      `}
                    >
                      {day}
                      {hasSlots && !sel && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary absolute bottom-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Slot editing for selected date */}
              {selectedDate && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-3">
                    {selectedDate.toLocaleDateString("it-IT", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Clicca sugli orari per aggiungere o rimuovere la tua disponibilità per questo giorno.
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                    {oreDisponibili.map((ora) => {
                      const dateStr = formatDateStr(selectedDate);
                      const active = slots.some((s) => s.date === dateStr && s.ora === ora);

                      return (
                        <button
                          key={ora}
                          onClick={() => toggleSlot(selectedDate, ora)}
                          className={`py-2 rounded text-xs font-mono transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80"
                          }`}
                        >
                          {ora}-{ora + 1}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {getSlotsForDate(formatDateStr(selectedDate)).length} slot selezionati per questo giorno
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {slots.length} slot totali impostati
            </p>
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
