import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Send, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const faqItems = [
  {
    q: "Come posso prenotare una prestazione?",
    a: "Accedi al tuo account, cerca il professionista o la prestazione che ti interessa dalla pagina 'Trova il tuo professionista', seleziona data e orario disponibili e procedi con la prenotazione e il pagamento."
  },
  {
    q: "Posso cancellare una prenotazione?",
    a: "Sì, puoi cancellare una prenotazione dalla tua dashboard. Ti consigliamo di farlo con almeno 24 ore di anticipo per rispetto del professionista."
  },
  {
    q: "Come faccio a registrarmi come professionista?",
    a: "Dalla pagina di registrazione seleziona 'Professionista', compila i campi richiesti (incluso numero di iscrizione all'albo e partita IVA), imposta i tuoi servizi, le tariffe e le disponibilità."
  },
  {
    q: "I pagamenti sono sicuri?",
    a: "Sì, tutti i pagamenti vengono gestiti tramite Stripe, una piattaforma di pagamento certificata e sicura. ComuniCARE non conserva i dati delle carte di credito."
  },
  {
    q: "Come posso modificare i miei dati personali?",
    a: "Accedi al tuo profilo dalla sezione 'Il tuo profilo' nel menu in alto a destra, poi clicca su 'Il mio profilo' per aggiornare le tue informazioni."
  },
  {
    q: "Cosa devo fare se riscontro un problema tecnico?",
    a: "Compila il modulo di contatto in questa pagina descrivendo il problema nel modo più dettagliato possibile, oppure scrivici direttamente a comunicaresanita@gmail.com. Ti risponderemo il prima possibile."
  },
  {
    q: "ComuniCARE è un'azienda sanitaria?",
    a: "No, ComuniCARE è un fornitore di servizi di intermediazione. La responsabilità della prestazione sanitaria è esclusivamente in capo al professionista abilitato."
  },
];

const Contatti = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !messaggio.trim()) {
      toast({ title: "Compila tutti i campi", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await supabase.functions.invoke("send-contact-email", {
        body: { nome, email, messaggio },
      });
      toast({ title: "Messaggio inviato!", description: "Ti risponderemo il prima possibile." });
      setNome("");
      setEmail("");
      setMessaggio("");
    } catch {
      toast({ title: "Errore nell'invio", description: "Riprova più tardi.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 bg-background py-6 md:py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" /> Torna indietro
          </Button>

          <h1 className="text-xl md:text-senior-3xl font-bold mb-2">Contatti</h1>
          <p className="text-base text-muted-foreground mb-8">
            Hai bisogno di aiuto o hai riscontrato un problema? Contattaci compilando il modulo qui sotto oppure scrivici direttamente via email.
          </p>

          {/* Contact Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="w-5 h-5 text-primary" /> Scrivici un messaggio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome e Cognome</Label>
                  <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Mario Rossi" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mario@email.com" required />
                </div>
                <div>
                  <Label htmlFor="messaggio">Messaggio</Label>
                  <Textarea id="messaggio" value={messaggio} onChange={e => setMessaggio(e.target.value)} placeholder="Descrivi il tuo problema o la tua richiesta..." rows={5} required />
                </div>
                <Button type="submit" disabled={sending} className="w-full">
                  {sending ? "Invio in corso..." : "Invia messaggio"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="mb-8">
            <CardContent className="p-6 flex items-center gap-4">
              <Mail className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-base">Scrivici direttamente</p>
                <a href="mailto:comunicaresanita@gmail.com" className="text-primary hover:underline text-sm md:text-base">
                  comunicaresanita@gmail.com
                </a>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Domande frequenti (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-sm md:text-base">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contatti;
