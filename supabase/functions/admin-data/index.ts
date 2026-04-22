import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AdminRequest = {
  password?: string;
  action?: "delete";
  userId?: string;
};

const ADMIN_EMAIL = "msm446@gmail.com";

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const ensureNoError = (error: { message: string } | null, message: string) => {
  if (error) {
    throw new Error(`${message}: ${error.message}`);
  }
};

const deleteUserEverywhere = async (supabase: ReturnType<typeof createClient>, userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  ensureNoError(profileError, "Impossibile leggere il profilo utente");

  if (profile) {
    ensureNoError(
      (await supabase.from("reviews").delete().or(`patient_id.eq.${profile.id},professional_id.eq.${profile.id}`)).error,
      "Impossibile eliminare le recensioni collegate"
    );

    ensureNoError(
      (await supabase.from("bookings").delete().or(`patient_id.eq.${profile.id},professional_id.eq.${profile.id}`)).error,
      "Impossibile eliminare le prenotazioni collegate"
    );

    ensureNoError(
      (await supabase.from("services").delete().eq("professional_id", profile.id)).error,
      "Impossibile eliminare i servizi collegati"
    );

    ensureNoError(
      (await supabase.from("availability").delete().eq("professional_id", profile.id)).error,
      "Impossibile eliminare le disponibilità settimanali"
    );

    ensureNoError(
      (await supabase.from("availability_overrides").delete().eq("professional_id", profile.id)).error,
      "Impossibile eliminare le eccezioni di disponibilità"
    );

    const storage = supabase.storage.from("profile-photos");
    const { data: files, error: listFilesError } = await storage.list(userId);
    ensureNoError(listFilesError, "Impossibile leggere le foto profilo");

    if (files && files.length > 0) {
      ensureNoError(
        (await storage.remove(files.map((file) => `${userId}/${file.name}`))).error,
        "Impossibile eliminare le foto profilo"
      );
    }

    ensureNoError(
      (await supabase.from("profiles").delete().eq("user_id", userId)).error,
      "Impossibile eliminare il profilo"
    );
  }

  const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId, false);
  ensureNoError(deleteAuthError, "Impossibile eliminare le credenziali utente");

  const { data: deletedProfileCheck, error: deletedProfileCheckError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  ensureNoError(deletedProfileCheckError, "Impossibile verificare l'eliminazione del profilo");

  if (deletedProfileCheck) {
    throw new Error("Eliminazione incompleta: il profilo risulta ancora presente nel database");
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Non autorizzato" }, 401);
    }

    const { password, action, userId }: AdminRequest = await req.json();
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!adminPassword || password !== adminPassword) {
      return jsonResponse({ error: "Password non valida" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
      return jsonResponse({ error: "Accesso admin non autorizzato" }, 403);
    }

    if (action === "delete") {
      if (!userId) {
        return jsonResponse({ error: "Utente non specificato" }, 400);
      }

      await deleteUserEverywhere(supabase, userId);
      return jsonResponse({ success: true });
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ profiles });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Errore sconosciuto";
    return jsonResponse({ error: errorMessage }, 500);
  }
});
