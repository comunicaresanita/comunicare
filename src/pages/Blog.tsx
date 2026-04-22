import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const articles = [
  {
    title: "L'importanza dell'assistenza infermieristica domiciliare per gli anziani",
    date: "15 Aprile 2026",
    summary: "L'assistenza domiciliare consente agli anziani di ricevere cure personalizzate nel comfort della propria casa, riducendo il rischio di infezioni ospedaliere e migliorando la qualità della vita. Studi dimostrano che i pazienti curati a domicilio hanno esiti clinici migliori rispetto a quelli ospedalizzati per patologie croniche.",
    source: "Organizzazione Mondiale della Sanità (OMS)",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/ageing-and-health",
  },
  {
    title: "Il ruolo del fisioterapista nella riabilitazione post-operatoria",
    date: "8 Aprile 2026",
    summary: "La riabilitazione fisioterapica precoce dopo un intervento chirurgico accelera il recupero funzionale e riduce i tempi di degenza. Le linee guida dell'AIFI (Associazione Italiana Fisioterapisti) raccomandano programmi personalizzati basati sulle esigenze individuali del paziente.",
    source: "Associazione Italiana Fisioterapisti (AIFI)",
    sourceUrl: "https://aifi.net",
  },
  {
    title: "OSS: una figura essenziale nell'assistenza socio-sanitaria",
    date: "1 Aprile 2026",
    summary: "L'Operatore Socio-Sanitario (OSS) svolge un ruolo fondamentale nel supporto alle persone con ridotta autonomia, contribuendo all'igiene personale, alla mobilizzazione e al supporto nelle attività quotidiane. Il Ministero della Salute ne riconosce l'importanza nel sistema sanitario integrato.",
    source: "Ministero della Salute",
    sourceUrl: "https://www.salute.gov.it",
  },
  {
    title: "Prevenzione delle lesioni da pressione: buone pratiche infermieristiche",
    date: "25 Marzo 2026",
    summary: "Le lesioni da pressione rappresentano un problema significativo per i pazienti allettati. La prevenzione attraverso il riposizionamento frequente, l'uso di presidi antidecubito e una corretta nutrizione è raccomandata dalle linee guida EPUAP/NPIAP come standard di cura.",
    source: "European Pressure Ulcer Advisory Panel (EPUAP)",
    sourceUrl: "https://www.epuap.org",
  },
  {
    title: "Telemedicina e assistenza domiciliare: il futuro della sanità",
    date: "18 Marzo 2026",
    summary: "L'integrazione tra telemedicina e assistenza domiciliare sta trasformando l'accesso alle cure. Il Piano Nazionale di Ripresa e Resilienza (PNRR) italiano prevede investimenti significativi per potenziare la telemedicina e l'assistenza territoriale, con l'obiettivo di migliorare la prossimità delle cure.",
    source: "Piano Nazionale di Ripresa e Resilienza (PNRR) – Italia",
    sourceUrl: "https://www.governo.it/it/approfondimento/pnrr/16718",
  },
  {
    title: "La gestione del dolore cronico: approcci fisioterapici evidence-based",
    date: "10 Marzo 2026",
    summary: "La fisioterapia offre soluzioni efficaci per la gestione del dolore cronico senza ricorrere a farmaci. Tecniche come la terapia manuale, l'esercizio terapeutico e l'educazione al dolore sono raccomandate dalla Cochrane Library come interventi di prima linea.",
    source: "Cochrane Library",
    sourceUrl: "https://www.cochranelibrary.com",
  },
];

const Blog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 bg-background py-6 md:py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" /> Torna indietro
          </Button>

          <h1 className="text-xl md:text-senior-3xl font-bold mb-2">Blog</h1>
          <p className="text-base text-muted-foreground mb-8">
            Articoli e approfondimenti sul mondo dell'assistenza sanitaria domiciliare.
          </p>

          <div className="space-y-6">
            {articles.map((article, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg leading-snug">{article.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5" /> {article.date}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{article.summary}</p>
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Fonte: {article.source}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
