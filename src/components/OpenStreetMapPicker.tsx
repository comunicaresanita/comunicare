import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { bluePinIcon } from "@/lib/leafletPin";

interface OpenStreetMapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const OpenStreetMapPicker = ({ onLocationSelect, initialLat, initialLng }: OpenStreetMapPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const selectRef = useRef(onLocationSelect);
  selectRef.current = onLocationSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: L.LatLngExpression = [initialLat ?? 43.7696, initialLng ?? 11.2558];
    const map = L.map(containerRef.current, { center, zoom: 13, scrollWheelZoom: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    mapRef.current = map;

    if (initialLat && initialLng) {
      markerRef.current = L.marker(center, { draggable: true, icon: bluePinIcon() })
        .addTo(map)
        .bindTooltip("Trascina per posizionare");
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current!.getLatLng();
        selectRef.current(pos.lat, pos.lng);
      });
      selectRef.current(initialLat, initialLng);
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      if (!markerRef.current) {
        markerRef.current = L.marker(e.latlng, { draggable: true, icon: bluePinIcon() })
          .addTo(map)
          .bindTooltip("Trascina per posizionare");
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          selectRef.current(pos.lat, pos.lng);
        });
      } else {
        markerRef.current.setLatLng(e.latlng);
      }
      selectRef.current(e.latlng.lat, e.latlng.lng);
    });

    // Ensure correct sizing once laid out
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter when the initial coordinates change (e.g. after address selection)
  useEffect(() => {
    if (!mapRef.current || !initialLat || !initialLng) return;
    const pos: L.LatLngExpression = [initialLat, initialLng];
    mapRef.current.setView(pos, Math.max(mapRef.current.getZoom(), 14));
    if (markerRef.current) {
      markerRef.current.setLatLng(pos);
    } else {
      markerRef.current = L.marker(pos, { draggable: true, icon: bluePinIcon() })
        .addTo(mapRef.current)
        .bindTooltip("Trascina per posizionare");
      markerRef.current.on("dragend", () => {
        const p = markerRef.current!.getLatLng();
        selectRef.current(p.lat, p.lng);
      });
    }
  }, [initialLat, initialLng]);

  return (
    <div className="space-y-2">
      <p className="text-senior-sm text-muted-foreground">
        Clicca sulla mappa o trascina il segnalino per indicare il punto in cui gli utenti vedranno la tua posizione. Non deve necessariamente corrispondere al tuo indirizzo di casa: può essere il luogo che frequenti di più o dove preferisci operare.
      </p>
      <div ref={containerRef} className="w-full h-64 rounded-lg border z-0" />
    </div>
  );
};

export default OpenStreetMapPicker;
