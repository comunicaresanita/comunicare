import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Send, ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { articles } from "@/data/blogArticles";

const patientFaqItems = [
  {
    q: "Come posso prenotare una prestazione?",
    a: "Accedi al tuo account, cerca il professionista o la prestazione che ti interessa dalla pagina 'Trova la prestazione o il professionista', seleziona data e orario disponibili e procedi con la prenotazione e il pagamento."
  },
  {
    q: "Posso prenotare una prestazione per un familiare o un'altra persona?",
    a: "Sì. Durante la prenotazione, dopo aver scelto data e orario, puoi indicare se la prestazione è per te o per un familiare/assistito. Selezionando 'Per un familiare / assistito' potrai inserire l'indirizzo della persona che riceverà la prestazione: il professionista si recherà a quell'indirizzo invece che al tuo. L'indirizzo del familiare viene salvato in automatico, così alle prenotazioni successive ti basterà sceglierlo con un clic."
  },
  {
    q: "Posso cancellare una prenotazione?",
    a: "Sì, puoi cancellare una prenotazione dalla tua dashboard. È obbligatorio avvisare almeno 24 ore prima della prestazione. In caso contrario, l'importo non sarà rimborsato."
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

const professionalFaqItems = [
  {
    q: "Come imposto i miei servizi e le mie tariffe?",
    a: "Dalla tua dashboard professionista accedi alla sezione 'Servizi e tariffe': puoi aggiungere o rimuovere prestazioni e impostare il prezzo base di ogni servizio. Le maggiorazioni per prestazioni notturne e festive vengono calcolate automaticamente al momento della prenotazione."
  },
  {
    q: "Come gestisco le mie disponibilità settimanali e le eccezioni?",
    a: "Dalla sezione 'Disponibilità' puoi indicare le fasce orarie in cui sei disponibile per ogni giorno della settimana."
  },
  {
    q: "Cosa devo fare quando ricevo una nuova prenotazione?",
    a: "Le prenotazioni vengono confermate automaticamente in base alle tue disponibilità. Riceverai una notifica via email con tutti i dettagli: paziente, prestazione, data, orario e indirizzo dove recarti. Controlla sempre l'indirizzo: se il paziente prenota come caregiver, l'indirizzo sarà quello dell'assistito, non del paziente."
  },
  {
    q: "Come funziona il pagamento delle prestazioni?",
    a: "Il pagamento viene gestito direttamente dalla piattaforma con pagamento online. Essendo i pagamenti gestiti tramite Stripe, gli accrediti seguono i tempi standard di tale piattaforma di pagamento."
  },
  {
    q: "Cosa succede se il paziente cancella o non si presenta?",
    a: "Il paziente è tenuto a cancellare almeno 24 ore prima della prestazione. In caso di cancellazione tardiva o di mancata presentazione, hai diritto al compenso per la prestazione prenotata. Segnala eventuali abusi tramite il modulo di contatto."
  },
  {
    q: "Come posso aggiornare il numero OPI/FNOFI o la partita IVA?",
    a: "Vai su 'Il mio profilo' dalla dashboard professionista. Da lì puoi modificare il numero di iscrizione all'albo (OPI per infermieri, FNOFI per fisioterapisti), la partita IVA, la bio e la zona di operatività."
  },
  {
    q: "Quali sono le mie responsabilità professionali sulla piattaforma?",
    a: "ComuniCARE è un servizio di intermediazione: la responsabilità clinica e professionale della prestazione è esclusivamente tua, in base alla normativa vigente per la tua professione. Devi essere regolarmente iscritto all'albo, in possesso di assicurazione professionale e operare nel rispetto del codice deontologico."
  },
  {
    q: "Cosa devo fare se riscontro un problema tecnico o con un paziente?",
    a: "Compila il modulo di contatto in questa pagina descrivendo dettagliatamente il problema, oppure scrivici a comunicaresanita@gmail.com. Per situazioni urgenti relative alla sicurezza tua o del paziente, segnalalo subito anche alle autorità competenti."
  },
];


const Contatti = () => {
  const { profile } = useAuth();
  const faqItems = profile?.role === "professionista" ? professionalFaqItems : patientFaqItems;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#faq") {
      setTimeout(() => {
        document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [location.hash]);

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
          <Card id="faq">
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

          {/* Ultimi articoli */}
          <h2 className="text-lg md:text-xl font-bold mt-10 mb-4">Ultimi articoli</h2>
          <div className="space-y-6">
            {articles.map((article) => (
              <Link to={`/blog/${article.slug}`} key={article.slug} className="block">
                <Card className="hover:border-primary transition-colors cursor-pointer overflow-hidden">
                  {article.imageUrl && (
                    <div className="w-full h-48 overflow-hidden">
                      <img src={article.imageUrl} alt={article.imageAlt} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg leading-snug">{article.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5" /> {article.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{article.summary}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Fonte: {article.source}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contatti;
