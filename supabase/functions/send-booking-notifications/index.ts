import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId } = await req.json();
    if (!bookingId) throw new Error("Missing bookingId");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch booking with related data
    const { data: booking, error: bookingErr } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) throw new Error("Booking not found");

    const [{ data: patient }, { data: professional }] = await Promise.all([
      supabaseClient.from("profiles").select("*").eq("id", booking.patient_id).single(),
      supabaseClient.from("profiles").select("*").eq("id", booking.professional_id).single(),
    ]);

    if (!patient || !professional) throw new Error("Profiles not found");

    // Get patient's auth email for sending
    const { data: patientAuth } = await supabaseClient.auth.admin.getUserById(patient.user_id);
    const { data: profAuth } = await supabaseClient.auth.admin.getUserById(professional.user_id);

    const patientEmail = patientAuth?.user?.email || patient.email;
    const professionalEmail = profAuth?.user?.email || professional.email;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Use AI to generate and structure the emails, then we'll log them
    // For now, store notification data so it can be sent when email infra is ready
    console.log("Booking notification data prepared:");
    console.log("Professional email:", professionalEmail);
    console.log("Patient email:", patientEmail);

    // Store notifications in a simple format
    const professionalNotification = {
      to: professionalEmail,
      subject: `Nuova prenotazione da ${patient.first_name} ${patient.last_name}`,
      body: `Hai una nuova prenotazione!\n\n` +
        `Paziente: ${patient.first_name} ${patient.last_name}\n` +
        `Prestazione: ${booking.service_name}\n` +
        `Giorno: ${booking.day}\n` +
        `Orario: ${booking.time_slot}\n` +
        `Indirizzo paziente: ${patient.address || "Non specificato"}\n` +
        `Prezzo: €${booking.price}\n\n` +
        `Accedi alla piattaforma per gestire la prenotazione.`,
    };

    const patientNotification = {
      to: patientEmail,
      subject: `Conferma prenotazione con ${professional.first_name} ${professional.last_name}`,
      body: `La tua prenotazione è confermata!\n\n` +
        `Professionista: ${professional.first_name} ${professional.last_name}\n` +
        `Prestazione: ${booking.service_name}\n` +
        `Giorno: ${booking.day}\n` +
        `Orario: ${booking.time_slot}\n` +
        `Tariffa pagata: €${booking.price}\n\n` +
        `Grazie per aver scelto il nostro servizio!`,
    };

    return new Response(JSON.stringify({ 
      success: true, 
      professionalNotification,
      patientNotification,
      message: "Notification data prepared. Email sending requires email domain setup." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
