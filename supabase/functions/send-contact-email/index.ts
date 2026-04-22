import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, email, messaggio } = await req.json();

    if (!nome || !email || !messaggio) {
      return new Response(JSON.stringify({ error: "Tutti i campi sono obbligatori" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (RESEND_API_KEY) {
      // Use Resend if available
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "ComuniCARE <noreply@comunicare.lovable.app>",
          to: ["comunicaresanita@gmail.com"],
          subject: `[ComuniCARE] Nuovo messaggio da ${nome}`,
          html: `
            <h2>Nuovo messaggio dal modulo contatti</h2>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Messaggio:</strong></p>
            <p>${messaggio.replace(/\n/g, "<br>")}</p>
          `,
          reply_to: email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Resend error:", errorData);
        throw new Error("Failed to send email via Resend");
      }
    } else {
      // Fallback: log the contact request (email will be stored for manual follow-up)
      console.log("Contact form submission:", { nome, email, messaggio });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Errore interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
