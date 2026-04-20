import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRESTAZIONI = [
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

**Servizi Infermieristici:**
${PRESTAZIONI.slice(0, 44).map(p => `- ${p}`).join("\n")}

**Servizi di Fisioterapia:**
${PRESTAZIONI.slice(44, 69).map(p => `- ${p}`).join("\n")}

**Servizi OSS (Operatore Socio-Sanitario):**
${PRESTAZIONI.slice(69).map(p => `- ${p}`).join("\n")}

Regole:
- Rispondi SEMPRE in italiano
- Sii empatico, chiaro e conciso (max 3-4 frasi per risposta)
- NON fare diagnosi mediche
- Suggerisci la prestazione più adatta tra quelle disponibili, specificando se è un servizio infermieristico, fisioterapico o OSS
- Se non sei sicuro, chiedi dettagli
- Se il caso richiede urgenza medica, consiglia di chiamare il 118 o recarsi al pronto soccorso
- Non inventare prestazioni che non sono nella lista
- Puoi anche suggerire di cercare un professionista per nome nella barra di ricerca della piattaforma`;

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
