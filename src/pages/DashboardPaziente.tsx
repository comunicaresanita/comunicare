import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { MapPin, Search, Star, ShieldCheck, Stethoscope, Navigation, User } from "lucide-react";
import ChatbotWidget from "@/components/ChatbotWidget";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { fuzzySearchServices, haversineKm } from "@/lib/searchUtils";

const prestazioniDisponibili = [
  // Infermieristici
  "Iniezione intramuscolare", "Iniezione sottocutanea", "Iniezione endovenosa",
  "Prelievo ematico a domicilio", "Medicazione semplice", "Medicazione complessa",
  "Medicazione ferita chirurgica", "Medicazione ulcera da pressione", "Medicazione ulcera venosa",
  "Rimozione punti di sutura", "Rimozione graffette chirurgiche",
  "Cateterismo vescicale maschile", "Cateterismo vescicale femminile",
  "Gestione e sostituzione catetere vescicale", "Clistere evacuativo",
  "Infusione endovenosa (flebo)", "Terapia infusionale sottocutanea",
  "Somministrazione terapia intramuscolare", "Somministrazione terapia orale",
  "Somministrazione insulina", "Misurazione glicemia capillare",
  "Misurazione parametri vitali completa", "Misurazione pressione arteriosa",
  "ECG a domicilio", "Gestione stomie (colostomia, ileostomia, urostomia)",
  "Sostituzione sacca stomia", "Gestione nutrizione enterale (SNG/PEG)",
  "Gestione nutrizione parenterale", "Aspirazione tracheale", "Gestione tracheostomia",
  "Gestione drenaggi", "Bendaggio compressivo", "Bendaggio elastocompressivo arti inferiori",
  "Assistenza post-operatoria a domicilio", "Assistenza post-dimissione ospedaliera",
  "Educazione sanitaria al paziente e caregiver", "Educazione alla gestione del diabete",
  "Prelievo per test rapido (tampone, urine)", "Lavaggio auricolare",
  "Aerosolterapia a domicilio", "Ossigenoterapia domiciliare - avvio e monitoraggio",
  "Assistenza domiciliare continuativa (per ora)", "Assistenza infermieristica notturna (per ora)",
  "Assistenza infermieristica diurna (per ora)",
  // Fisioterapia
  "Riabilitazione motoria a domicilio", "Riabilitazione post-operatoria (protesi anca/ginocchio)",
  "Riabilitazione post-frattura", "Riabilitazione post-ictus", "Riabilitazione neurologica",
  "Riabilitazione respiratoria", "Riabilitazione pavimento pelvico", "Riabilitazione sportiva",
  "Linfodrenaggio manuale", "Massoterapia decontratturante", "Terapia manuale ortopedica",
  "Ginnastica posturale a domicilio", "Ginnastica dolce per anziani",
  "Rieducazione alla deambulazione", "Mobilizzazione articolare",
  "Trattamento cervicalgia/lombalgia", "Kinesio taping",
  "Esercizio terapeutico personalizzato", "Stretching terapeutico",
  "Laser terapia", "Laser terapia YAG", "Tecar terapia",
  "Onde d'urto", "Elettrostimolazione", "Ultrasuono", "Valutazione ecografica",
  // OSS
  "Igiene personale completa a letto", "Bagno assistito in vasca/doccia",
  "Vestizione e svestizione assistita", "Cambio pannolone e igiene intima",
  "Mobilizzazione e cambio postura a letto", "Trasferimento letto-carrozzina/poltrona",
  "Assistenza alla deambulazione", "Assistenza ai pasti e imboccamento",
  "Preparazione pasti a domicilio", "Compagnia e sorveglianza diurna (per ora)",
  "Sorveglianza notturna (per ora)", "Accompagnamento a visite mediche",
  "Accompagnamento a passeggiate", "Piccola spesa e commissioni",
  "Stimolazione cognitiva e attività ricreative", "Supporto nella gestione della casa leggera",
  "Assistenza continuativa diurna (per ora)", "Assistenza continuativa notturna (per ora)",
];

interface ProfessionistaData {
  profileId: string;
  nome: string;
  bio: string;
  lat: number;
  lng: number;
  zona: string;
  servizi: { name: string; price: number }[];
  valutazione: number;
  recensioni: number;
  professionalType: string;
  photoUrl: string | null;
  verified: boolean;
}

type SearchMode = "prestazione" | "professionista";

const DashboardPaziente = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [prestazioneSelezionata, setPrestazioneSelezionata] = useState("");
  const [professionistaSelezionato, setProfessionistaSelezionato] = useState<ProfessionistaData | null>(null);
  const [ricerca, setRicerca] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("prestazione");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [professionisti, setProfessionisti] = useState<ProfessionistaData[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Fuzzy search for services
  const prestazioniFiltrate = useMemo(
    () => searchMode === "prestazione" ? fuzzySearchServices(ricerca, prestazioniDisponibili) : [],
    [ricerca, searchMode]
  );

  // Fuzzy search for professional names
  const professionistiSuggeriti = useMemo(() => {
    if (searchMode !== "professionista" || !ricerca.trim()) return [];
    const q = ricerca.toLowerCase().trim();
    return professionisti.filter((p) => p.nome.toLowerCase().includes(q)).slice(0, 10);
  }, [ricerca, searchMode, professionisti]);

  // Filter professionals by selected service
  const professionistiFiltrati = useMemo(() => {
    if (!prestazioneSelezionata) return [];
    const filtered = professionisti.filter((p) =>
      p.servizi.some((s) => s.name === prestazioneSelezionata)
    );
    if (userCoords) {
      filtered.forEach((p: any) => {
        p._distKm = haversineKm(userCoords.lat, userCoords.lng, p.lat, p.lng);
      });
      filtered.sort((a: any, b: any) => (a._distKm ?? 999) - (b._distKm ?? 999));
    }
    return filtered;
  }, [prestazioneSelezionata, professionisti, userCoords]);

  // When switching mode, reset selections
  const handleModeSwitch = (mode: SearchMode) => {
    setSearchMode(mode);
    setRicerca("");
    setPrestazioneSelezionata("");
    setProfessionistaSelezionato(null);
  };

  const handleSelectProfessionista = (p: ProfessionistaData) => {
    setProfessionistaSelezionato(p);
    setRicerca(p.nome);
    setPrestazioneSelezionata("");
  };

  // --- Maps & data loading (unchanged) ---
  useEffect(() => {
    if ((window as any).google?.maps) {
      setMapsLoaded(true);
      return;
    }
    if (document.getElementById("google-maps-script")) return;
    const loadMaps = async () => {
      try {
        const { data } = await supabase.functions.invoke("get-maps-key");
        if (data?.apiKey) {
          const script = document.createElement("script");
          script.id = "google-maps-script";
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=geocoding&callback=initMap`;
          script.async = true;
          script.defer = true;
          (window as any).initMap = () => setMapsLoaded(true);
          document.head.appendChild(script);
        }
      } catch (err) {
        console.error("Failed to load Google Maps:", err);
      }
    };
    loadMaps();
  }, []);

  useEffect(() => {
    if (!mapsLoaded || !profile?.address) return;
    if (profile.lat && profile.lng) {
      setUserCoords({ lat: profile.lat, lng: profile.lng });
      return;
    }
    const google = (window as any).google;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: profile.address + ", Italia" }, (results: any[], status: string) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        setUserCoords({ lat: loc.lat(), lng: loc.lng() });
      } else {
        setUserCoords({ lat: 43.7696, lng: 11.2558 });
      }
    });
  }, [mapsLoaded, profile]);

  useEffect(() => {
    const fetchProfessionisti = async () => {
      const { data: professionals } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, bio, lat, lng, zona, professional_type, photo_url, verified")
        .eq("role", "professionista");

      if (!professionals || professionals.length === 0) return;
      const profIds = professionals.map((p) => p.id);

      const [{ data: services }, { data: reviews }] = await Promise.all([
        supabase.from("services").select("professional_id, name, price").in("professional_id", profIds),
        supabase.from("reviews").select("professional_id, rating").in("professional_id", profIds),
      ]);

      const mapped: ProfessionistaData[] = professionals
        .filter((p) => p.lat && p.lng)
        .map((p) => {
          const profServices = (services || []).filter((s) => s.professional_id === p.id);
          const profReviews = (reviews || []).filter((r) => r.professional_id === p.id);
          const avg = profReviews.length > 0
            ? Math.round((profReviews.reduce((sum, r) => sum + r.rating, 0) / profReviews.length) * 10) / 10
            : 0;
          return {
            profileId: p.id,
            nome: `${p.first_name} ${p.last_name}`,
            bio: p.bio || "",
            lat: p.lat!,
            lng: p.lng!,
            zona: p.zona || "",
            servizi: profServices.map((s) => ({ name: s.name, price: s.price })),
            valutazione: avg,
            recensioni: profReviews.length,
            professionalType: (p as any).professional_type || "infermiere",
            photoUrl: (p as any).photo_url || null,
            verified: (p as any).verified || false,
          };
        });
      setProfessionisti(mapped);
    };
    fetchProfessionisti();
  }, []);

  // Professionals to show on map
  const mapProfessionals = useMemo(() => {
    if (prestazioneSelezionata) return professionistiFiltrati;
    return professionisti;
  }, [professionistaSelezionato, prestazioneSelezionata, professionistiFiltrati, professionisti]);

  // Map rendering
  useEffect(() => {
    if (!mapRef.current || !mapsLoaded) return;
    const google = (window as any).google;
    if (!google) return;

    const center = userCoords || { lat: 43.7696, lng: 11.2558 };
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center, zoom: 11,
        styles: [{ featureType: "poi", stylers: [{ visibility: "simplified" }] }],
      });
    }

    markersRef.current.forEach((m: any) => m.setMap(null));
    markersRef.current = [];

    mapProfessionals.forEach((p) => {
      const marker = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapInstanceRef.current,
        title: p.nome,
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
          fillColor: "#4A90D9", fillOpacity: 1, strokeColor: "#2a6cb6", strokeWeight: 1.5, scale: 1.8,
          anchor: new google.maps.Point(12, 22),
        },
      });
      marker.addListener("click", () => {
        if (!prestazioneSelezionata) {
          // No service selected: show this professional's card
          handleSelectProfessionista(p);
          setTimeout(() => {
            const el = document.getElementById(`prof-card-selected`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        } else {
          const el = document.getElementById(`prof-card-${p.profileId}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      markersRef.current.push(marker);
    });

    if (userCoords) {
      const userMarker = new google.maps.Marker({
        position: userCoords, map: mapInstanceRef.current, title: "La tua posizione",
        icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: "#22c55e", fillOpacity: 1, strokeColor: "#16a34a", strokeWeight: 2, scale: 8 },
      });
      markersRef.current.push(userMarker);
    }

    if (mapProfessionals.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      if (userCoords) bounds.extend(userCoords);
      mapProfessionals.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      mapInstanceRef.current.fitBounds(bounds);
      google.maps.event.addListenerOnce(mapInstanceRef.current, "bounds_changed", () => {
        if (mapInstanceRef.current.getZoom() > 14) mapInstanceRef.current.setZoom(14);
      });
    } else if (userCoords) {
      mapInstanceRef.current.setCenter(userCoords);
      mapInstanceRef.current.setZoom(12);
    }
  }, [mapProfessionals, mapsLoaded, userCoords, prestazioneSelezionata]);

  const typeLabel = (t: string) => t === "oss" ? "OSS" : t === "fisioterapista" ? "Fisioterapista" : "Infermiere";

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 bg-background py-6 md:py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h1 className="md:text-senior-3xl font-bold mb-2 text-2xl">
            Trova il tuo professionista
          </h1>
          <p className="text-sm md:text-senior-base text-muted-foreground mb-6 md:mb-8">
            Seleziona la prestazione di cui hai bisogno o il nome dello specialista più vicino a te.
          </p>

          <Card className="mb-6 md:mb-8">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-senior-lg flex items-center gap-2">
                <Search className="w-5 h-5" /> Cerca per
              </CardTitle>
              <div className="flex gap-2 mt-2 text-sm">
                <button
                  onClick={() => handleModeSwitch("prestazione")}
                  className={`px-3 py-1.5 rounded-full text-sm md:text-sm font-medium transition-colors ${
                    searchMode === "prestazione"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Prestazione
                </button>
                <button
                  onClick={() => handleModeSwitch("professionista")}
                  className={`px-3 py-1.5 rounded-full text-sm md:text-sm font-medium transition-colors flex items-center gap-1 ${
                    searchMode === "professionista"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Professionista
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <div className="relative">
                <input
                  type="text" value={ricerca}
                  onChange={(e) => {
                    setRicerca(e.target.value);
                    if (searchMode === "professionista") setProfessionistaSelezionato(null);
                  }}
                  placeholder={searchMode === "prestazione" ? "Cerca una prestazione..." : "Cerca per nome e cognome..."}
                  className="w-full border rounded-md p-3 text-sm md:text-senior-sm bg-background mb-4"
                />
                {/* Name autocomplete dropdown */}
                {searchMode === "professionista" && ricerca.trim() && !professionistaSelezionato && professionistiSuggeriti.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 top-12 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {professionistiSuggeriti.map((p) => (
                      <button
                        key={p.profileId}
                        onClick={() => handleSelectProfessionista(p)}
                        className="w-full text-left px-4 py-2.5 hover:bg-secondary flex items-center gap-3 text-sm border-b last:border-b-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.photoUrl ? (
                            <img src={p.photoUrl} alt={p.nome} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium">{p.nome}</span>
                          <span className="text-xs text-muted-foreground ml-2">{typeLabel(p.professionalType)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Service suggestions (only when typing) */}
              {searchMode === "prestazione" && ricerca.trim() && !prestazioneSelezionata && prestazioniFiltrate.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 md:max-h-64 overflow-y-auto mt-2">
                  {prestazioniFiltrate.map((p) => (
                    <button key={p} onClick={() => { setPrestazioneSelezionata(p); setRicerca(p); setProfessionistaSelezionato(null); }}
                      className="text-left p-2.5 md:p-3 rounded-lg border border-border hover:border-primary/50 transition-colors text-sm md:text-senior-sm"
                    >{p}</button>
                  ))}
                </div>
              )}
              {prestazioneSelezionata && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-primary font-medium">Prestazione selezionata: {prestazioneSelezionata}</span>
                  <button onClick={() => { setPrestazioneSelezionata(""); setRicerca(""); }} className="text-xs text-muted-foreground underline hover:text-foreground">Cambia</button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map always visible */}
          <div ref={mapRef} className="w-full h-56 md:h-80 rounded-lg overflow-hidden border mb-4 md:mb-6 bg-secondary">
            {!mapsLoaded && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                  <p className="text-senior-sm text-muted-foreground">Caricamento mappa...</p>
                </div>
              </div>
            )}
          </div>

          {/* === Results: by service === */}
          {prestazioneSelezionata && !professionistaSelezionato && (
            <>
              <h2 className="text-base md:text-senior-xl font-semibold mb-4">
                Professionisti disponibili per: <span className="text-primary">{prestazioneSelezionata}</span>
              </h2>
              <div className="space-y-4">
                {professionistiFiltrati.map((p) => {
                  const servizio = p.servizi.find((s) => s.name === prestazioneSelezionata);
                  const distKm = (p as any)._distKm as number | undefined;
                  return (
                    <Card id={`prof-card-${p.profileId}`} key={p.profileId} className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                      onClick={() => navigate(`/profilo-infermiere/${p.profileId}?servizio=${encodeURIComponent(prestazioneSelezionata)}`)}
                    >
                      <CardContent className="p-4 md:p-6 flex items-start md:items-center gap-3 md:gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.photoUrl ? (
                            <img src={p.photoUrl} alt={p.nome} className="w-full h-full object-cover" />
                          ) : (
                            <Stethoscope className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm md:text-senior-lg font-semibold">{p.nome}</h3>
                            {p.verified && (
                              <span className="inline-flex items-center gap-0.5 text-white text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "#0097B2" }}>
                                <ShieldCheck className="w-3 h-3" /> Verificato
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-medium text-primary bg-secondary px-2 py-0.5 rounded">{typeLabel(p.professionalType)}</span>
                            {p.valutazione > 0 && (
                              <span className="flex items-center gap-0.5 text-sm">
                                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                {p.valutazione}
                              </span>
                            )}
                          </div>
                          <p className="text-xs md:text-senior-sm text-muted-foreground truncate mt-1">{p.bio}</p>
                          {(p.zona || distKm !== undefined) && (
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              {p.zona && (<span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {p.zona}</span>)}
                              {distKm !== undefined && (
                                <span className="flex items-center gap-1 font-medium text-primary">
                                  <Navigation className="w-3.5 h-3.5" /> ~{distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${Math.round(distKm)} km`}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {servizio && (
                          <div className="text-right flex-shrink-0">
                            <p className="text-base md:text-senior-lg font-bold text-primary">€{servizio.price}</p>
                            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">per questa prestazione</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {professionistiFiltrati.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-senior-base text-muted-foreground">
                      Nessun professionista disponibile per questa prestazione al momento.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* === Results: by professional name === */}
          {professionistaSelezionato && (
            <Card id="prof-card-selected" className="transition-shadow border-2 hover:border-primary">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start md:items-center gap-3 md:gap-6 mb-4">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {professionistaSelezionato.photoUrl ? (
                      <img src={professionistaSelezionato.photoUrl} alt={professionistaSelezionato.nome} className="w-full h-full object-cover" />
                    ) : (
                      <Stethoscope className="w-7 h-7 md:w-10 md:h-10 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base md:text-senior-xl font-semibold">{professionistaSelezionato.nome}</h3>
                      {professionistaSelezionato.verified && (
                        <span className="inline-flex items-center gap-0.5 text-white text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "#0097B2" }}>
                          <ShieldCheck className="w-3 h-3" /> Verificato
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-medium text-primary bg-secondary px-2 py-0.5 rounded">{typeLabel(professionistaSelezionato.professionalType)}</span>
                      {professionistaSelezionato.valutazione > 0 && (
                        <span className="flex items-center gap-0.5 text-sm">
                          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" /> {professionistaSelezionato.valutazione}
                        </span>
                      )}
                    </div>
                    {professionistaSelezionato.bio && (
                      <p className="text-xs md:text-senior-sm text-muted-foreground mt-1">{professionistaSelezionato.bio}</p>
                    )}
                    {professionistaSelezionato.zona && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" /> {professionistaSelezionato.zona}
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-sm md:text-senior-base font-semibold mb-2 mt-2">Prestazioni offerte:</h4>
                <p className="text-xs text-muted-foreground mb-2">Seleziona una prestazione per accedere al calendario delle disponibilità.</p>
                <div className="space-y-1.5">
                  {professionistaSelezionato.servizi.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => navigate(`/profilo-infermiere/${professionistaSelezionato.profileId}?servizio=${encodeURIComponent(s.name)}`)}
                      className="flex w-full justify-between items-center p-2 rounded-md bg-secondary/50 text-xs md:text-sm text-left transition-colors hover:bg-secondary"
                    >
                      <span>{s.name}</span>
                      <span className="font-bold text-primary ml-2 flex-shrink-0">€{s.price}</span>
                    </button>
                  ))}
                  {professionistaSelezionato.servizi.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nessuna prestazione configurata.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <ChatbotWidget 
        onSelectService={(service) => {
          setSearchMode("prestazione");
          setRicerca(service);
          setPrestazioneSelezionata(service);
          setProfessionistaSelezionato(null);
        }}
        professionals={professionisti.map(p => ({ profileId: p.profileId, nome: p.nome }))}
      />
      <Footer />
    </div>
  );
};

export default DashboardPaziente;
