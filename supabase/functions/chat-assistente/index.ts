import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRESTAZIONI = [
  "Iniezione intramuscolare", "Iniezione sottocutanea", "Prelievo ematico a domicilio",
  "Medicazione semplice", "Medicazione complessa", "Rimozione punti di sutura",
  "Cateterismo vescicale", "Gestione catetere vescicale", "Clistere evacuativo",
  "Infusione endovenosa (flebo)", "Terapia infusionale sottocutanea",
  "Misurazione parametri vitali", "Gestione stomie", "Assistenza post-operatoria",
  "Educazione sanitaria al paziente", "Somministrazione terapia orale",
  "Gestione nutrizione enterale (SNG/PEG)", "Bendaggio compressivo",
  "Assistenza domiciliare continuativa", "ECG a domicilio",
  "Fisioterapia a domicilio", "Riabilitazione motoria", "Riabilitazione post-operatoria",
  "Riabilitazione neurologica", "Riabilitazione respiratoria", "Massoterapia",
  "Linfodrenaggio manuale", "Terapia manuale ortopedica", "Ginnastica posturale",
  "Rieducazione funzionale", "Mobilizzazione articolare", "Esercizio terapeutico",
  "Igiene personale assistita", "Mobilizzazione paziente", "Assistenza alla deambulazione",
  "Assistenza ai pasti", "Vestizione e svestizione assistita", "Cambio pannolone",
  "Compagnia e sorveglianza", "Supporto nelle attività quotidiane",
  "Accompagnamento a visite mediche", "Preparazione e somministrazione pasti",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) throw new Error("Invalid messages");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Sei un assistente sanitario virtuale per una piattaforma italiana che mette in contatto pazienti con professionisti sanitari a domicilio (infermieri, fisioterapisti, OSS).

Il tuo compito è aiutare gli utenti a capire quale prestazione sanitaria fa al caso loro, basandoti sui sintomi o necessità che descrivono.

Le prestazioni disponibili sulla piattaforma sono:
${PRESTAZIONI.map(p => `- ${p}`).join("\n")}

Regole:
- Rispondi SEMPRE in italiano
- Sii empatico, chiaro e conciso (max 3-4 frasi per risposta)
- NON fare diagnosi mediche
- Suggerisci la prestazione più adatta tra quelle disponibili
- Se non sei sicuro, chiedi dettagli
- Se il caso richiede urgenza medica, consiglia di chiamare il 118 o recarsi al pronto soccorso
- Non inventare prestazioni che non sono nella lista`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ reply: "Troppi messaggi inviati. Attendi qualche secondo e riprova." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Non sono riuscito a elaborare una risposta.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg, reply: "Si è verificato un errore. Riprova." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
