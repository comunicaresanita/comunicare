import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Errore",
        description: "Inserisci email e password.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Replace with real Supabase auth
    // Simulate role-based redirect
    // In production, the role will come from the database
    toast({
      title: "Accesso effettuato",
      description: "Benvenuto su ComuniCARE!",
    });

    // Placeholder: redirect based on role
    // When backend is connected, check user role from DB
    // For now, redirect to patient dashboard as default
    navigate("/dashboard-paziente");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Errore",
        description: "Inserisci la tua email.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Email inviata",
      description: "Se l'email è registrata, riceverai un link per reimpostare la password.",
    });
    setForgotPassword(false);
  };

  if (forgotPassword) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background py-12">
          <div className="container mx-auto px-6 max-w-md">
            <Card>
              <CardHeader className="text-center">
                <Mail className="w-12 h-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-senior-xl">Recupera Password</CardTitle>
                <p className="text-senior-sm text-muted-foreground mt-2">
                  Inserisci la tua email e ti invieremo un link per reimpostare la password.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-senior-base">Email</Label>
                    <Input
                      type="email"
                      placeholder="La tua email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="h-12 text-senior-base"
                    />
                  </div>
                  <Button type="submit" className="w-full py-6">
                    Invia Link di Recupero
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setForgotPassword(false)}
                  >
                    Torna al Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-senior-xl">Accedi a ComuniCARE</CardTitle>
              <p className="text-senior-sm text-muted-foreground mt-2">
                Inserisci le tue credenziali per accedere
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-senior-base">Email</Label>
                  <Input
                    type="email"
                    placeholder="La tua email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-senior-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-senior-base">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="La tua password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 text-senior-base pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setForgotPassword(true)}
                    className="text-senior-sm text-primary hover:underline"
                  >
                    Password dimenticata?
                  </button>
                </div>
                <Button type="submit" className="w-full py-6">
                  Accedi
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-senior-sm text-muted-foreground">
                  Non hai un account?{" "}
                  <Link to="/registrazione" className="text-primary hover:underline font-semibold">
                    Registrati
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
