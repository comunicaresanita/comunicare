import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleMapPicker from "@/components/GoogleMapPicker";
import { User, Stethoscope, Upload, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Ruolo = "paziente" | "professionista";
type TipoProfessionista = "infermiere" | "oss" | "fisioterapista";

const Registrazione = () => {
  const [searchParams] = useSearchParams();
  const ruoloParam = searchParams.get("ruolo");
  const initialRole = ruoloParam === "professionista" ? "professionista" : ruoloParam === "paziente" ? "paziente" : null;
  const [ruolo, setRuolo] = useState<Ruolo | null>(initialRole);
  const [tipoProfessionista, setTipoProfessionista] = useState<TipoProfessionista | null>(null);
  const [consensoTermini, setConsensoTermini] = useState(false);
  const [consensoPrivacy, setConsensoPrivacy] = useState(false);
  const [consensoSanitario, setConsensoSanitario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [indirizzo, setIndirizzo] = useState("");
  const [bio, setBio] = useState("");
  const [numeroOpi, setNumeroOpi] = useState("");
  const [numeroFnofi, setNumeroFnofi] = useState("");
  const [partitaIva, setPartitaIva] = useState("");
  const [partitaIvaError, setPartitaIvaError] = useState("");
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const validatePartitaIva = (piva: string): boolean => {
    if (!piva) return true;
    return /^\d{11}$/.test(piva);
  };

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("Inserisci un indirizzo email valido (es. nome@dominio.it).");
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Le password non corrispondono", description: "Assicurati che le due password siano identiche.", variant: "destructive" });
      return;
    }

    if (!consensoTermini || !consensoPrivacy) {
      toast({ title: "Consensi obbligatori", description: "Devi accettare tutti i consensi obbligatori per procedere.", variant: "destructive" });
      return;
    }

    if (ruolo === "paziente" && !consensoSanitario) {
      toast({ title: "Consenso obbligatorio", description: "Devi acconsentire al trattamento dei dati sanitari per procedere.", variant: "destructive" });
      return;
    }

    if (ruolo === "professionista" && partitaIva && !validatePartitaIva(partitaIva)) {
      setPartitaIvaError("La partita IVA deve essere di 11 cifre.");
      return;
    }

    if (ruolo === "professionista" && (!mapLat || !mapLng)) {
      toast({ title: "Posizione obbligatoria", description: "Indica sulla mappa il punto in cui vuoi essere visibile.", variant: "destructive" });
      return;
    }

    if (ruolo === "professionista" && tipoProfessionista === "infermiere" && !numeroOpi) {
      toast({ title: "OPI obbligatorio", description: "Il numero di iscrizione OPI è obbligatorio per gli infermieri.", variant: "destructive" });
      return;
    }

    if (ruolo === "professionista" && tipoProfessionista === "fisioterapista" && !numeroFnofi) {
      toast({ title: "FNOFI obbligatorio", description: "Il numero di iscrizione FNOFI è obbligatorio per i fisioterapisti.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const metadata: Record<string, string> = {
      role: ruolo!,
      first_name: nome,
      last_name: cognome,
      address: indirizzo,
      bio: bio || "",
      numero_opi: numeroOpi || "",
      numero_fnofi: numeroFnofi || "",
      partita_iva: partitaIva || "",
    };
    if (ruolo === "professionista") {
      metadata.professional_type = tipoProfessionista || "infermiere";
      if (mapLat && mapLng) {
        metadata.lat = String(mapLat);
        metadata.lng = String(mapLng);
      }
    }
    const { error } = await signUp(email, password, metadata);
    setLoading(false);

    if (error) {
      toast({ title: "Errore di registrazione", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Registrazione completata!", description: "Il tuo account è stato creato con successo." });

    if (ruolo === "professionista") {
      navigate("/setup-professionista");
    } else {
      navigate("/dashboard-paziente");
    }
  };

  // Step 1: Choose role
  if (!ruolo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background py-16">
          <div className="container mx-auto px-6 max-w-2xl">
            <h1 className="text-senior-2xl md:text-senior-3xl font-bold text-center mb-4">
              Crea il tuo account
            </h1>
            <p className="text-senior-base text-muted-foreground text-center mb-10">
              Seleziona il tuo profilo per iniziare la registrazione.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all" onClick={() => setRuolo("paziente")}>
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-senior-xl font-semibold mb-2">Utente</h3>
                  <p className="text-senior-sm text-muted-foreground">Cerca e prenota servizi sanitari a domicilio.</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all" onClick={() => setRuolo("professionista")}>
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
                    <Stethoscope className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-senior-xl font-semibold mb-2">Professionista</h3>
                  <p className="text-senior-sm text-muted-foreground">Offri i tuoi servizi sanitari sulla piattaforma.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Step 2: Choose professional type (only for professionista)
  if (ruolo === "professionista" && !tipoProfessionista) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background py-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <Button variant="ghost" className="mb-6 text-senior-sm" onClick={() => setRuolo(null)}>
              ← Torna alla selezione
            </Button>
            <h1 className="text-senior-2xl md:text-senior-3xl font-bold text-center mb-4">
              Che tipo di professionista sei?
            </h1>
            <p className="text-senior-base text-muted-foreground text-center mb-10">
              Seleziona la tua categoria professionale.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all" onClick={() => setTipoProfessionista("infermiere")}>
                <CardContent className="p-6 text-center">
                  <h3 className="text-senior-lg font-semibold mb-2">🩺 Infermiere</h3>
                  <p className="text-sm text-muted-foreground">Iscritto all'OPI</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all" onClick={() => setTipoProfessionista("oss")}>
                <CardContent className="p-6 text-center">
                  <h3 className="text-senior-lg font-semibold mb-2">🤝 OSS</h3>
                  <p className="text-sm text-muted-foreground">Operatore Socio Sanitario</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all" onClick={() => setTipoProfessionista("fisioterapista")}>
                <CardContent className="p-6 text-center">
                  <h3 className="text-senior-lg font-semibold mb-2">💪 Fisioterapista</h3>
                  <p className="text-sm text-muted-foreground">Iscritto alla FNOFI</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tipoProfLabel = tipoProfessionista === "oss" ? "OSS" : tipoProfessionista === "fisioterapista" ? "fisioterapista" : "infermiere";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <Button variant="ghost" className="mb-6 text-senior-sm" onClick={() => {
            if (ruolo === "professionista") {
              setTipoProfessionista(null);
            } else {
              setRuolo(null);
            }
          }}>
            ← Torna indietro
          </Button>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-senior-xl">
                Registrazione {ruolo === "paziente" ? "utente" : tipoProfLabel}
              </CardTitle>
              <CardDescription className="text-senior-sm">
                {ruolo === "paziente" ? "Inserisci i tuoi dati per cercare e prenotare servizi." : "Inserisci i tuoi dati professionali per offrire servizi."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-senior-sm">Nome *</Label>
                    <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Il tuo nome" required className="text-senior-sm py-3" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cognome" className="text-senior-sm">Cognome *</Label>
                    <Input id="cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} placeholder="Il tuo cognome" required className="text-senior-sm py-3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-senior-sm">Email *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(""); }} placeholder="email@esempio.it" required className="text-senior-sm py-3" />
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-senior-sm">Password *</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimo 8 caratteri" required minLength={8} className="text-senior-sm py-3 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="text-senior-sm">Conferma password *</Label>
                  <div className="relative">
                    <Input id="confirm_password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Riscrivi la password" required minLength={8} className="text-senior-sm py-3 pr-12" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-destructive">Le password non corrispondono.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="indirizzo" className="text-senior-sm">Indirizzo *</Label>
                  <Input id="indirizzo" value={indirizzo} onChange={(e) => setIndirizzo(e.target.value)} placeholder="Via, numero civico" required className="text-senior-sm py-3" />
                </div>

                {ruolo === "professionista" && (
                  <>
                    <div className="border-t pt-6">
                      <h3 className="text-senior-lg font-semibold mb-4">Dati professionali</h3>

                      <div className="p-4 rounded-lg border border-amber-300 bg-amber-50 mb-4">
                        <p className="text-senior-sm text-amber-800">
                          ⚠️ <strong>Assicurazione obbligatoria:</strong> per operare sulla piattaforma è necessario essere in possesso di un'assicurazione professionale valida.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {/* OPI for infermiere */}
                        {tipoProfessionista === "infermiere" && (
                          <div className="space-y-2">
                            <Label htmlFor="numero_opi" className="text-senior-sm">Numero iscrizione OPI *</Label>
                            <Input id="numero_opi" value={numeroOpi} onChange={(e) => setNumeroOpi(e.target.value)} placeholder="Es. FI-12345" required className="text-senior-sm py-3" />
                          </div>
                        )}

                        {/* FNOFI for fisioterapista */}
                        {tipoProfessionista === "fisioterapista" && (
                          <div className="space-y-2">
                            <Label htmlFor="numero_fnofi" className="text-senior-sm">Numero iscrizione FNOFI *</Label>
                            <Input id="numero_fnofi" value={numeroFnofi} onChange={(e) => setNumeroFnofi(e.target.value)} placeholder="Es. 12345" required className="text-senior-sm py-3" />
                          </div>
                        )}

                        {/* No albo required for OSS */}

                        <div className="space-y-2">
                          <Label htmlFor="partita_iva" className="text-senior-sm">Partita IVA</Label>
                          <Input id="partita_iva" value={partitaIva} onChange={(e) => { setPartitaIva(e.target.value); setPartitaIvaError(""); }} placeholder="Es. 12345678901" maxLength={11} className="text-senior-sm py-3" />
                          {partitaIvaError && <p className="text-sm text-destructive">{partitaIvaError}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-senior-sm">Bio / specializzazioni</Label>
                          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Descrivi la tua esperienza e le tue specializzazioni..." className="text-senior-sm" rows={3} />
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-6">
                      <h3 className="text-senior-lg font-semibold mb-4">Posizione sulla mappa *</h3>
                      <GoogleMapPicker
                        onLocationSelect={(lat, lng) => {
                          setMapLat(lat);
                          setMapLng(lng);
                        }}
                      />
                    </div>
                    <div className="border-t pt-6">
                      <h3 className="text-senior-lg font-semibold mb-4">Documenti di verifica</h3>
                      <p className="text-senior-sm text-muted-foreground mb-4">Carica i documenti richiesti per la verifica del tuo profilo.</p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="doc_identita" className="text-senior-sm">Documento d'identità *</Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <Input id="doc_identita" type="file" accept=".pdf,.jpg,.jpeg,.png" required className="text-senior-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="border-t pt-6">
                  <h3 className="text-senior-lg font-semibold mb-4">Consensi obbligatori</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox id="consenso_termini" checked={consensoTermini} onCheckedChange={(c) => setConsensoTermini(c === true)} className="mt-1" />
                      <Label htmlFor="consenso_termini" className="text-senior-sm leading-relaxed cursor-pointer">
                        Accetto i <Link to="/termini" className="text-primary underline font-medium" target="_blank">termini e condizioni</Link> del servizio. *
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox id="consenso_privacy" checked={consensoPrivacy} onCheckedChange={(c) => setConsensoPrivacy(c === true)} className="mt-1" />
                      <Label htmlFor="consenso_privacy" className="text-senior-sm leading-relaxed cursor-pointer">
                        Acconsento al trattamento dei miei dati personali ai sensi del <Link to="/privacy" className="text-primary underline font-medium" target="_blank">GDPR (Reg. UE 2016/679)</Link>. *
                      </Label>
                    </div>
                    {ruolo === "paziente" && (
                      <div className="flex items-start space-x-3">
                        <Checkbox id="consenso_sanitario" checked={consensoSanitario} onCheckedChange={(c) => setConsensoSanitario(c === true)} className="mt-1" />
                        <Label htmlFor="consenso_sanitario" className="text-senior-sm leading-relaxed cursor-pointer">
                          Acconsento al trattamento dei dati sanitari (dati particolari ex Art. 9 GDPR) necessari per l'erogazione del servizio. *
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full text-senior-base font-semibold py-6 text-primary-foreground" disabled={loading}>
                  {loading ? "Registrazione in corso..." : "Completa registrazione"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Registrazione;
