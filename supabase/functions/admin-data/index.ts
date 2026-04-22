import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { password, action, userId } = await req.json();
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!adminPassword || password !== adminPassword) {
      return new Response(JSON.stringify({ error: "Password non valida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Delete user action
    if (action === "delete" && userId) {
      // Get profile id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (profile) {
        await supabase.from("reviews").delete().or(`patient_id.eq.${profile.id},professional_id.eq.${profile.id}`);
        await supabase.from("bookings").delete().or(`patient_id.eq.${profile.id},professional_id.eq.${profile.id}`);
        await supabase.from("services").delete().eq("professional_id", profile.id);
        await supabase.from("availability").delete().eq("professional_id", profile.id);
        await supabase.from("availability_overrides").delete().eq("professional_id", profile.id);

        const { data: files } = await supabase.storage.from("profile-photos").list(userId);
        if (files && files.length > 0) {
          await supabase.storage.from("profile-photos").remove(files.map(f => `${userId}/${f.name}`));
        }

        await supabase.from("profiles").delete().eq("user_id", userId);
      }

      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: fetch all profiles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ profiles }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
