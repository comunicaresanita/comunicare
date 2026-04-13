import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Google Maps API key not configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  try {
    const { action, input, placeId } = await req.json();

    if (action === "autocomplete") {
      const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify({
          input,
          includedRegionCodes: ["it"],
          includedPrimaryTypes: ["street_address", "subpremise", "premise", "route"],
          languageCode: "it",
        }),
      });
      const data = await res.json();
      
      // Transform to a simple format for the client
      const predictions = (data.suggestions || [])
        .filter((s: any) => s.placePrediction)
        .map((s: any) => ({
          place_id: s.placePrediction.placeId,
          description: s.placePrediction.text?.text || "",
        }));

      return new Response(JSON.stringify({ predictions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "details") {
      const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "formattedAddress,location,addressComponents",
        },
      });
      const data = await res.json();

      // Transform to match our client expectations
      let street = "", streetNumber = "", cap = "", city = "", province = "";
      for (const comp of data.addressComponents || []) {
        const types: string[] = comp.types || [];
        if (types.includes("route")) street = comp.longText || "";
        if (types.includes("street_number")) streetNumber = comp.longText || "";
        if (types.includes("postal_code")) cap = comp.longText || "";
        if (types.includes("locality")) city = comp.longText || "";
        if (types.includes("administrative_area_level_2")) province = comp.shortText || "";
        if (!city && types.includes("administrative_area_level_3")) city = comp.longText || "";
      }

      return new Response(JSON.stringify({
        result: {
          formatted_address: data.formattedAddress || "",
          geometry: {
            location: {
              lat: data.location?.latitude || 0,
              lng: data.location?.longitude || 0,
            },
          },
          address_components: { street, streetNumber, cap, city, province },
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
