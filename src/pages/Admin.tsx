import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Lock, Users, UserCheck, Activity, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

type Profile = {
  id: string;
  user_id: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string | null;
  bio: string | null;
  numero_opi: string | null;
  numero_fnofi: string | null;
  partita_iva: string | null;
  phone: string | null;
  photo_url: string | null;
  professional_type: string | null;
  age: number | null;
  additional_info: string | null;
  is_caregiver: boolean | null;
  zona: string | null;
  lat: number | null;
  lng: number | null;
  verified: boolean;
  created_at: string;
};

const COLORS = ["#0097B2", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"];

const professionalTypeLabel = (type: string | null) => {
  switch (type) {
    case "infermiere": return "Infermiere";
    case "oss": return "OSS";
    case "fisioterapista": return "Fisioterapista";
    default: return type || "N/A";
  }
};

const Admin = () => {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-data", {
        body: { password },
      });
      if (fnError || data?.error) {
        setError(data?.error || "Errore di autenticazione");
        return;
      }
      setProfiles(data.profiles);
      setAuthenticated(true);
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-3 text-primary" />
            <CardTitle className="text-2xl">Admin ComuniCARE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Password amministratore"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? "Accesso..." : "Accedi"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const utenti = profiles.filter((p) => p.role === "paziente");
  const professionisti = profiles.filter((p) => p.role === "professionista");
  const infermieri = professionisti.filter((p) => p.professional_type === "infermiere");
  const oss = professionisti.filter((p) => p.professional_type === "oss");
  const fisioterapisti = professionisti.filter((p) => p.professional_type === "fisioterapista");

  const pieData = [
    { name: "Utenti", value: utenti.length },
    { name: "Infermieri", value: infermieri.length },
    { name: "OSS", value: oss.length },
    { name: "Fisioterapisti", value: fisioterapisti.length },
  ].filter((d) => d.value > 0);

  // Timeline: group signups by month
  const timelineMap: Record<string, number> = {};
  profiles.forEach((p) => {
    const month = format(parseISO(p.created_at), "yyyy-MM");
    timelineMap[month] = (timelineMap[month] || 0) + 1;
  });
  const timelineData = Object.entries(timelineMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: format(parseISO(month + "-01"), "MMM yyyy", { locale: it }),
      iscritti: count,
    }));

  // Cumulative timeline
  let cumulative = 0;
  const cumulativeData = Object.entries(timelineMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      cumulative += count;
      return {
        month: format(parseISO(month + "-01"), "MMM yyyy", { locale: it }),
        totale: cumulative,
      };
    });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <Button variant="outline" onClick={() => { setAuthenticated(false); setPassword(""); }}>
            Esci
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Totale Iscritti", value: profiles.length, icon: Users, color: "text-primary" },
            { label: "Utenti", value: utenti.length, icon: UserCheck, color: "text-amber-500" },
            { label: "Infermieri", value: infermieri.length, icon: Activity, color: "text-emerald-500" },
            { label: "OSS", value: oss.length, icon: Activity, color: "text-red-500" },
            { label: "Fisioterapisti", value: fisioterapisti.length, icon: Activity, color: "text-violet-500" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuzione Utenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Iscrizioni nel tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="iscritti" fill="#0097B2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cumulative chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Crescita totale iscritti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="totale" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Users table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tutti gli iscritti ({profiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ruolo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data iscrizione</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((p) => (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-muted" onClick={() => setSelectedUser(p)}>
                      <TableCell className="font-medium">{p.first_name} {p.last_name}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.role === "professionista" ? "Professionista" : "Utente"}</TableCell>
                      <TableCell>{p.role === "professionista" ? professionalTypeLabel(p.professional_type) : "—"}</TableCell>
                      <TableCell>{format(parseISO(p.created_at), "dd/MM/yyyy HH:mm", { locale: it })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* User detail dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{selectedUser?.first_name} {selectedUser?.last_name}</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-3 text-sm">
                {[
                  ["Email", selectedUser.email],
                  ["Telefono", selectedUser.phone],
                  ["Ruolo", selectedUser.role === "professionista" ? "Professionista" : "Utente"],
                  ["Tipo professionista", selectedUser.role === "professionista" ? professionalTypeLabel(selectedUser.professional_type) : null],
                  ["Indirizzo", selectedUser.address],
                  ["Zona", selectedUser.zona],
                  ["Età", selectedUser.age],
                  ["Bio", selectedUser.bio],
                  ["Partita IVA", selectedUser.partita_iva],
                  ["Numero OPI", selectedUser.numero_opi],
                  ["Numero FNOFI", selectedUser.numero_fnofi],
                  ["Caregiver", selectedUser.is_caregiver ? "Sì" : "No"],
                  ["Info aggiuntive", selectedUser.additional_info],
                  ["Verificato", selectedUser.verified ? "Sì" : "No"],
                  ["Coordinate", selectedUser.lat && selectedUser.lng ? `${selectedUser.lat}, ${selectedUser.lng}` : null],
                  ["Data iscrizione", format(parseISO(selectedUser.created_at), "dd/MM/yyyy HH:mm", { locale: it })],
                ].filter(([, val]) => val !== null && val !== undefined && val !== "").map(([label, val]) => (
                  <div key={label as string} className="flex justify-between border-b pb-2">
                    <span className="font-medium text-muted-foreground">{label}</span>
                    <span className="text-right max-w-[60%]">{String(val)}</span>
                  </div>
                ))}
                {selectedUser.photo_url && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-2">Foto profilo</p>
                    <img src={selectedUser.photo_url} alt="Foto" className="w-24 h-24 rounded-full object-cover" />
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
