import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Exchange the auth code/token from the URL
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // Try to extract tokens from hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
      }

      // Wait a moment for session to settle
      setTimeout(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("user_id", user.id)
            .single();

          if (profile?.role === "professionista") {
            navigate("/dashboard-professionista", { replace: true });
          } else {
            navigate("/dashboard-paziente", { replace: true });
          }
        } else {
          navigate("/login", { replace: true });
        }
      }, 500);
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-senior-base text-muted-foreground">Verifica in corso...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
