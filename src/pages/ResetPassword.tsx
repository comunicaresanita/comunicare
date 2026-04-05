import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast({ title: "Link non valido", description: "Questo link di recupero password non è valido.", variant: "destructive" });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password aggiornata", description: "La tua password è stata aggiornata con successo." });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background py-16 flex items-center justify-center">
        <Card className="w-full max-w-md mx-6">
          <CardHeader>
            <CardTitle className="text-senior-xl text-center">Nuova password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input type="password" placeholder="Nuova password (min. 8 caratteri)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="text-senior-sm py-3" />
              <Button type="submit" className="w-full py-5" disabled={loading}>
                {loading ? "Aggiornamento..." : "Aggiorna password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
