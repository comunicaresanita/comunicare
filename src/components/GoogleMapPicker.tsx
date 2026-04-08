/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GoogleMapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const GoogleMapPicker = ({ onLocationSelect, initialLat, initialLng }: GoogleMapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      try {
        if ((window as any).google?.maps) {
          setLoaded(true);
          return;
        }

        if (document.getElementById("google-maps-picker-script")) {
          // Script already loading, wait for it
          const interval = setInterval(() => {
            if ((window as any).google?.maps) {
              setLoaded(true);
              clearInterval(interval);
            }
          }, 200);
          return;
        }

        const { data } = await supabase.functions.invoke("get-maps-key");
        if (!data?.apiKey) {
          setError("Impossibile caricare Google Maps.");
          return;
        }

        const script = document.createElement("script");
        script.id = "google-maps-picker-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
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

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
      });

      markerRef.current = new google.maps.Marker({
        position: initialLat ? center : undefined,
        map: mapInstanceRef.current,
        draggable: true,
        title: "Trascina per posizionare",
      });

      if (initialLat) {
        onLocationSelect(initialLat, initialLng!);
      }

      mapInstanceRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        markerRef.current?.setPosition(e.latLng);
        onLocationSelect(e.latLng.lat(), e.latLng.lng());
      });

      markerRef.current.addListener("dragend", () => {
        const pos = markerRef.current?.getPosition();
        if (pos) onLocationSelect(pos.lat(), pos.lng());
      });
    } else {
      // Update existing map center if initialLat changed
      mapInstanceRef.current.setCenter(center);
      if (initialLat && markerRef.current) {
        markerRef.current.setPosition(center);
      }
    }
  }, [loaded, initialLat, initialLng]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;

  return (
    <div className="space-y-2">
      <p className="text-senior-sm text-muted-foreground">
        Clicca sulla mappa o trascina il segnalino per indicare il punto in cui gli utenti vedranno la tua posizione. Non deve necessariamente corrispondere al tuo indirizzo di casa: può essere il luogo che frequenti di più o dove preferisci operare.
      </p>
      <div ref={mapRef} className="w-full h-64 rounded-lg border" />
    </div>
  );
};

export default GoogleMapPicker;
