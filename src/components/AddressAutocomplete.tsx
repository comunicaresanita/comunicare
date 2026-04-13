/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface AddressAutocompleteProps {
  value: string;
  onChange: (fullAddress: string) => void;
  onPlaceSelect?: (details: {
    fullAddress: string;
    street: string;
    streetNumber: string;
    cap: string;
    city: string;
    province: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const loadGoogleMaps = (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if ((window as any).google?.maps?.places) {
      resolve();
      return;
    }

    if (document.getElementById("google-maps-picker-script")) {
      const interval = setInterval(() => {
        if ((window as any).google?.maps?.places) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
      return;
    }

    try {
      const { data } = await supabase.functions.invoke("get-maps-key");
      if (!data?.apiKey) {
        reject(new Error("No API key"));
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-picker-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.head.appendChild(script);
    } catch {
      reject(new Error("Failed to load Google Maps"));
    }
  });
};

const AddressAutocomplete = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Inizia a digitare il tuo indirizzo...",
  required = false,
  className = "",
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setReady(true))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "it" },
      fields: ["address_components", "formatted_address", "geometry"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;

      let street = "";
      let streetNumber = "";
      let cap = "";
      let city = "";
      let province = "";

      for (const comp of place.address_components) {
        const types = comp.types;
        if (types.includes("route")) street = comp.long_name;
        if (types.includes("street_number")) streetNumber = comp.long_name;
        if (types.includes("postal_code")) cap = comp.long_name;
        if (types.includes("locality")) city = comp.long_name;
        if (types.includes("administrative_area_level_2")) province = comp.short_name;
        if (!city && types.includes("administrative_area_level_3")) city = comp.long_name;
      }

      const fullAddress = place.formatted_address || "";
      onChange(fullAddress);

      if (onPlaceSelect) {
        const lat = place.geometry?.location?.lat() || 0;
        const lng = place.geometry?.location?.lng() || 0;
        onPlaceSelect({ fullAddress, street, streetNumber, cap, city, province, lat, lng });
      }
    });

    autocompleteRef.current = autocomplete;
  }, [ready]);

  return (
    <Input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={`text-senior-sm py-3 ${className}`}
    />
  );
};

export default AddressAutocomplete;
