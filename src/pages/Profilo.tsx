import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, ArrowLeft } from "lucide-react";

const Profilo = () => {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [numeroOpi, setNumeroOpi] = useState("");
  const [partitaIva, setPartitaIva] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isCaregiver, setIsCaregiver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setAddress((profile as any).address || "");
      setBio(profile.bio || "");
      setNumeroOpi(profile.numero_opi || "");
      setPartitaIva((profile as any).partita_iva || "");
      setPhotoUrl((profile as any).photo_url || "");
      setPhone((profile as any).phone || "");
      setAge((profile as any).age ? String((profile as any).age) : "");
      setAdditionalInfo((profile as any).additional_info || "");
      setIsCaregiver((profile as any).is_caregiver || false);
    }
  }, [profile]);

  const handleBack = () => {
    if (profile?.role === "professionista") {
      navigate("/dashboard-professionista");
    } else {
      navigate("/dashboard-paziente");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage.from("profile-photos").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Errore upload", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("profile-photos").getPublicUrl(path);
    setPhotoUrl(publicUrl);

    await supabase.from("profiles").update({ photo_url: publicUrl } as any).eq("user_id", user.id);
    await refreshProfile();
    setUploading(false);
    toast({ title: "Foto aggiornata" });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const updates: any = {
      first_name: firstName,
      last_name: lastName,
      address,
      bio,
    };
    if (profile.role === "professionista") {
      updates.numero_opi = numeroOpi;
      updates.partita_iva = partitaIva;
    }
    if (profile.role === "paziente") {
      updates.phone = phone;
      updates.age = age ? parseInt(age) : null;
      updates.additional_info = additionalInfo;
      updates.is_caregiver = isCaregiver;
    }
    const { error } = await supabase.from("profiles").update(updates).eq("user_id", user!.id);
    setSaving(false);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profilo aggiornato" });
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <Button variant="ghost" onClick={handleBack} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Torna indietro
          </Button>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-senior-xl">Il mio profilo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.role === "professionista" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Foto profilo" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="text-sm text-primary underline">{uploading ? "Caricamento..." : "Cambia foto"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-senior-sm">Nome</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="text-senior-sm py-3" />
                </div>
                <div className="space-y-2">
                  <Label className="text-senior-sm">Cognome</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="text-senior-sm py-3" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-senior-sm">Email</Label>
                <Input value={profile.email} disabled className="text-senior-sm py-3 bg-muted" />
              </div>

              <div className="space-y-2">
                <Label className="text-senior-sm">Indirizzo</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} className="text-senior-sm py-3" />
              </div>

              {profile.role === "paziente" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-senior-sm">Numero di cellulare</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Es. +39 333 1234567" className="text-senior-sm py-3" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-senior-sm">Età</Label>
                    <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Es. 72" className="text-senior-sm py-3" min="1" max="120" />
                  </div>
                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-border bg-muted/30">
                    <Checkbox
                      id="caregiver"
                      checked={isCaregiver}
                      onCheckedChange={(checked) => setIsCaregiver(checked === true)}
                      className="mt-0.5"
                    />
                    <div>
                      <Label htmlFor="caregiver" className="text-senior-sm font-medium cursor-pointer">Sono un caregiver</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Un caregiver è una persona che si prende cura di un familiare o conoscente che necessita di assistenza. Seleziona questa opzione se stai cercando cure per qualcun altro.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-senior-sm">Informazioni aggiuntive</Label>
                    <Textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Inserisci eventuali informazioni utili (es. patologie, allergie, esigenze particolari...)" className="text-senior-sm" rows={3} />
                  </div>
                </>
              )}

              {profile.role === "professionista" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-senior-sm">Numero iscrizione OPI</Label>
                    <Input value={numeroOpi} onChange={(e) => setNumeroOpi(e.target.value)} className="text-senior-sm py-3" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-senior-sm">Partita IVA</Label>
                    <Input value={partitaIva} onChange={(e) => setPartitaIva(e.target.value)} maxLength={11} className="text-senior-sm py-3" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-senior-sm">Bio / specializzazioni</Label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="text-senior-sm" rows={3} />
                  </div>
                </>
              )}

              <Button onClick={handleSave} className="w-full py-5 text-primary-foreground" disabled={saving}>
                {saving ? "Salvataggio..." : "Salva modifiche"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profilo;
