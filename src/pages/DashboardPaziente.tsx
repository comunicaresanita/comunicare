import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { MapPin, Search, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const prestazioniDisponibili = [
  "Iniezione intramuscolare", "Iniezione sottocutanea", "Prelievo ematico a domicilio",
  "Medicazione semplice", "Medicazione complessa", "Rimozione punti di sutura",
  "Cateterismo vescicale", "Gestione catetere vescicale", "Clistere evacuativo",
  "Infusione endovenosa (flebo)", "Terapia infusionale sottocutanea",
  "Misurazione parametri vitali", "Gestione stomie", "Assistenza post-operatoria",
  "Educazione sanitaria al paziente", "Somministrazione terapia orale",
  "Gestione nutrizione enterale (SNG/PEG)", "Bendaggio compressivo",
  "Assistenza domiciliare continuativa", "ECG a domicilio",
];

interface InfermiereData {
  profileId: string;
  nome: string;
  bio: string;
  lat: number;
  lng: number;
  zona: string;
  servizi: { name: string; price: number }[];
  valutazione: number;
  recensioni: number;
}

const DashboardPaziente = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [prestazioneSelezionata, setPrestazioneSelezionata] = useState("");
  const [ricerca, setRicerca] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [infermieri, setInfermieri] = useState<InfermiereData[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const prestazioniFiltrate = prestazioniDisponibili.filter((p) =>
    p.toLowerCase().includes(ricerca.toLowerCase())
  );

  const infermieriFiltrati = prestazioneSelezionata
    ? infermieri.filter((inf) => inf.servizi.some((s) => s.name === prestazioneSelezionata))
    : [];

  // Load Google Maps script via edge function
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

  // Geocode user address to get coordinates
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
        // Default to Florence center
        setUserCoords({ lat: 43.7696, lng: 11.2558 });
      }
    });
  }, [mapsLoaded, profile]);

  // Fetch professionals with services and reviews
  useEffect(() => {
    const fetchInfermieri = async () => {
      const { data: professionals } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, bio, lat, lng, zona")
        .eq("role", "professionista");

      if (!professionals || professionals.length === 0) return;

      const profIds = professionals.map((p) => p.id);

      const [{ data: services }, { data: reviews }] = await Promise.all([
        supabase.from("services").select("professional_id, name, price").in("professional_id", profIds),
        supabase.from("reviews").select("professional_id, rating").in("professional_id", profIds),
      ]);

      const mapped: InfermiereData[] = professionals
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
          };
        });

      setInfermieri(mapped);
    };

    fetchInfermieri();
  }, []);

  // Initialize/update map
  useEffect(() => {
    if (!prestazioneSelezionata || !mapRef.current || !mapsLoaded) return;
    const google = (window as any).google;
    if (!google) return;

    const center = userCoords || { lat: 43.7696, lng: 11.2558 };

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        styles: [{ featureType: "poi", stylers: [{ visibility: "simplified" }] }],
      });
    } else {
      mapInstanceRef.current.setCenter(center);
    }

    // Clear existing markers
    markersRef.current.forEach((m: any) => m.setMap(null));
    markersRef.current = [];

    infermieriFiltrati.forEach((inf) => {
      const marker = new google.maps.Marker({
        position: { lat: inf.lat, lng: inf.lng },
        map: mapInstanceRef.current,
        title: inf.nome,
        label: { text: inf.nome.split(" ")[0], color: "white", fontSize: "11px" },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding:8px"><strong>${inf.nome}</strong><br/><span>⭐ ${inf.valutazione}</span><br/><span>${inf.zona}</span></div>`,
      });

      marker.addListener("click", () => {
        navigate(`/profilo-infermiere/${inf.profileId}`);
      });
      marker.addListener("mouseover", () => infoWindow.open(mapInstanceRef.current, marker));
      marker.addListener("mouseout", () => infoWindow.close());
      markersRef.current.push(marker);
    });

    if (infermieriFiltrati.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      infermieriFiltrati.forEach((inf) => bounds.extend({ lat: inf.lat, lng: inf.lng }));
      if (userCoords) bounds.extend(userCoords);
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [prestazioneSelezionata, infermieriFiltrati, navigate, mapsLoaded, userCoords]);

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-senior-2xl md:text-senior-3xl font-bold mb-2">
            Trova il tuo infermiere
          </h1>
          <p className="text-senior-base text-muted-foreground mb-8">
            Seleziona la prestazione di cui hai bisogno per trovare gli infermieri più vicini a te.
          </p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center gap-2">
                <Search className="w-5 h-5" /> Scegli la prestazione
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text" value={ricerca} onChange={(e) => setRicerca(e.target.value)}
                placeholder="Cerca una prestazione..."
                className="w-full border rounded-md p-3 text-senior-sm bg-background mb-4"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {prestazioniFiltrate.map((p) => (
                  <button key={p} onClick={() => setPrestazioneSelezionata(p)}
                    className={`text-left p-3 rounded-lg border transition-colors text-senior-sm ${
                      prestazioneSelezionata === p ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/50"
                    }`}
                  >{p}</button>
                ))}
              </div>
            </CardContent>
          </Card>

          {prestazioneSelezionata && (
            <>
              <h2 className="text-senior-xl font-semibold mb-4">
                Infermieri disponibili per: <span className="text-primary">{prestazioneSelezionata}</span>
              </h2>

              {/* Google Maps */}
              <div ref={mapRef} className="w-full h-80 rounded-lg overflow-hidden border mb-6 bg-secondary">
                {!mapsLoaded && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                      <p className="text-senior-sm text-muted-foreground">Caricamento mappa...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {infermieriFiltrati.map((inf) => {
                  const servizio = inf.servizi.find((s) => s.name === prestazioneSelezionata);
                  return (
                    <Card key={inf.profileId} className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                      onClick={() => navigate(`/profilo-infermiere/${inf.profileId}`)}
                    >
                      <CardContent className="p-6 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-senior-xl flex-shrink-0">
                          {inf.nome[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-senior-lg font-semibold">{inf.nome}</h3>
                          <p className="text-senior-sm text-muted-foreground truncate">{inf.bio}</p>
                          <div className="flex items-center gap-4 mt-2">
                            {inf.valutazione > 0 && (
                              <span className="flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                {inf.valutazione} ({inf.recensioni} recensioni)
                              </span>
                            )}
                            {inf.zona && (
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" /> {inf.zona}
                              </span>
                            )}
                          </div>
                        </div>
                        {servizio && (
                          <div className="text-right flex-shrink-0">
                            <p className="text-senior-lg font-bold text-primary">€{servizio.price}</p>
                            <p className="text-sm text-muted-foreground">per prestazione</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {infermieriFiltrati.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-senior-base text-muted-foreground">
                      Nessun infermiere disponibile per questa prestazione al momento.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPaziente;
