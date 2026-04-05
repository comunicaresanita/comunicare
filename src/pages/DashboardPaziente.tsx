import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Search, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

// Mock data for demo - in production this comes from DB
const infermieriMock = [
  { id: "inf-1", nome: "Maria Rossi", bio: "Infermiera con 15 anni di esperienza in assistenza domiciliare.", lat: 43.7710, lng: 11.2486, zona: "Centro storico", valutazione: 4.8, recensioni: 47, servizi: ["Medicazione semplice", "Medicazione complessa", "Iniezione intramuscolare", "Prelievo ematico a domicilio", "Gestione stomie"], prezzi: { "Medicazione semplice": 20, "Medicazione complessa": 35, "Iniezione intramuscolare": 15, "Prelievo ematico a domicilio": 25, "Gestione stomie": 35 } },
  { id: "inf-2", nome: "Luca Bianchi", bio: "Infermiere specializzato in terapie infusive e prelievi.", lat: 43.7650, lng: 11.2600, zona: "Campo di Marte", valutazione: 4.6, recensioni: 32, servizi: ["Infusione endovenosa (flebo)", "Prelievo ematico a domicilio", "Iniezione intramuscolare", "Iniezione sottocutanea", "Cateterismo vescicale"], prezzi: { "Infusione endovenosa (flebo)": 40, "Prelievo ematico a domicilio": 22, "Iniezione intramuscolare": 14, "Iniezione sottocutanea": 14, "Cateterismo vescicale": 38 } },
  { id: "inf-3", nome: "Giulia Verdi", bio: "Infermiera pediatrica con esperienza in assistenza domiciliare.", lat: 43.7730, lng: 11.2400, zona: "Rifredi", valutazione: 4.9, recensioni: 61, servizi: ["Assistenza post-operatoria", "Medicazione semplice", "Misurazione parametri vitali", "Educazione sanitaria al paziente", "Assistenza domiciliare continuativa"], prezzi: { "Assistenza post-operatoria": 45, "Medicazione semplice": 22, "Misurazione parametri vitali": 15, "Educazione sanitaria al paziente": 28, "Assistenza domiciliare continuativa": 32 } },
  { id: "inf-4", nome: "Andrea Conti", bio: "Infermiere con specializzazione in ECG e parametri vitali.", lat: 43.7580, lng: 11.2700, zona: "Coverciano", valutazione: 4.7, recensioni: 28, servizi: ["ECG a domicilio", "Misurazione parametri vitali", "Prelievo ematico a domicilio", "Iniezione intramuscolare", "Bendaggio compressivo"], prezzi: { "ECG a domicilio": 48, "Misurazione parametri vitali": 15, "Prelievo ematico a domicilio": 25, "Iniezione intramuscolare": 15, "Bendaggio compressivo": 25 } },
];

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const DashboardPaziente = () => {
  const navigate = useNavigate();
  const [prestazioneSelezionata, setPrestazioneSelezionata] = useState("");
  const [ricerca, setRicerca] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const prestazioniFiltrate = prestazioniDisponibili.filter((p) =>
    p.toLowerCase().includes(ricerca.toLowerCase())
  );

  const infermieriFiltrati = prestazioneSelezionata
    ? infermieriMock.filter((inf) => inf.servizi.includes(prestazioneSelezionata))
    : [];

  // Load Google Maps script
  useEffect(() => {
    if (document.getElementById("google-maps-script")) return;
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    (window as any).initMap = () => {};
    document.head.appendChild(script);
  }, []);

  // Initialize/update map
  useEffect(() => {
    if (!prestazioneSelezionata || !mapRef.current || !(window as any).google) return;

    const google = (window as any).google;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 43.7696, lng: 11.2558 },
        zoom: 13,
        styles: [{ featureType: "poi", stylers: [{ visibility: "simplified" }] }],
      });
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
        navigate(`/profilo-infermiere/${inf.id}`);
      });
      marker.addListener("mouseover", () => infoWindow.open(mapInstanceRef.current, marker));
      marker.addListener("mouseout", () => infoWindow.close());
      markersRef.current.push(marker);
    });

    if (infermieriFiltrati.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      infermieriFiltrati.forEach((inf) => bounds.extend({ lat: inf.lat, lng: inf.lng }));
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [prestazioneSelezionata, infermieriFiltrati, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
                {!(window as any).google && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                      <p className="text-senior-sm text-muted-foreground">Caricamento mappa...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {infermieriFiltrati.map((inf) => (
                  <Card key={inf.id} className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                    onClick={() => navigate(`/profilo-infermiere/${inf.id}`)}
                  >
                    <CardContent className="p-6 flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-senior-xl flex-shrink-0">
                        {inf.nome[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-senior-lg font-semibold">{inf.nome}</h3>
                        <p className="text-senior-sm text-muted-foreground truncate">{inf.bio}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            {inf.valutazione} ({inf.recensioni} recensioni)
                          </span>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" /> {inf.zona}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-senior-lg font-bold text-primary">
                          €{(inf.prezzi as Record<string, number>)[prestazioneSelezionata]}
                        </p>
                        <p className="text-sm text-muted-foreground">per prestazione</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
