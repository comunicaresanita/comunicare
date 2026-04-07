import { useEffect, useRef, useState } from "react";

interface GoogleMapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const GoogleMapPicker = ({ onLocationSelect, initialLat, initialLng }: GoogleMapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMap = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-maps-key`,
          { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
        );
        const { key } = await res.json();

        if ((window as any).google?.maps) {
          setLoaded(true);
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setLoaded(true);
        script.onerror = () => setError("Impossibile caricare Google Maps.");
        document.head.appendChild(script);
      } catch {
        setError("Impossibile caricare Google Maps.");
      }
    };
    loadMap();
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const center = { lat: initialLat || 43.77, lng: initialLng || 11.25 };
    const newMap = new google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
    });

    const newMarker = new google.maps.Marker({
      position: initialLat ? center : undefined,
      map: newMap,
      draggable: true,
      title: "Trascina per posizionare",
    });

    if (initialLat) {
      onLocationSelect(initialLat, initialLng!);
    }

    newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      newMarker.setPosition(e.latLng);
      onLocationSelect(e.latLng.lat(), e.latLng.lng());
    });

    newMarker.addListener("dragend", () => {
      const pos = newMarker.getPosition();
      if (pos) onLocationSelect(pos.lat(), pos.lng());
    });

    setMap(newMap);
    setMarker(newMarker);
  }, [loaded]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;

  return (
    <div className="space-y-2">
      <p className="text-senior-sm text-muted-foreground">
        Clicca sulla mappa o trascina il segnalino per indicare il punto in cui gli utenti vedranno la tua posizione. Non deve corrispondere al tuo indirizzo di casa: può essere il luogo che frequenti di più o dove preferisci operare.
      </p>
      <div ref={mapRef} className="w-full h-64 rounded-lg border" />
    </div>
  );
};

export default GoogleMapPicker;
