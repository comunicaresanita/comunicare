import { useNavigate } from "react-router-dom";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-6 max-w-3xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Torna indietro
          </Button>
          <h1 className="text-senior-2xl md:text-senior-3xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-senior-sm text-muted-foreground mb-8 italic">
            Ultimo aggiornamento: Aprile 2026 — Documento segnaposto da far revisionare da un DPO / legale.
          </p>

          <div className="prose prose-lg max-w-none space-y-8 text-senior-sm text-foreground">
            <section>
              <h2 className="text-senior-xl font-semibold mb-3">1. Titolare del Trattamento</h2>
              <p>Il Titolare del trattamento dei dati personali è ComuniCARE, con sede legale in Firenze, Italia. Email: privacy@comunicare.it.</p>
            </section>

            <section>
              <h2 className="text-senior-xl font-semibold mb-3">2. Dati Raccolti</h2>
              <p>La Piattaforma raccoglie le seguenti categorie di dati:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dati anagrafici:</strong> nome, cognome, email, indirizzo.</li>
                <li><strong>Dati professionali (per infermieri):</strong> numero iscrizione OPI, documento d'identità, certificato OPI, tariffa.</li>
                <li><strong>Dati di geolocalizzazione:</strong> indirizzo e coordinate per il calcolo delle distanze.</li>
                <li><strong>Dati sanitari (per pazienti):</strong> informazioni relative alle prestazioni richieste, trattati come dati particolari ex Art. 9 GDPR.</li>
                <li><strong>Dati di navigazione:</strong> log di accesso, indirizzo IP, tipo di browser.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-senior-xl font-semibold mb-3">3. Base Giuridica del Trattamento</h2>
              <p>Il trattamento dei dati si fonda sulle seguenti basi giuridiche (Art. 6 e Art. 9 GDPR):</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Esecuzione del contratto:</strong> per l'erogazione dei servizi della Piattaforma.</li>
                <li><strong>Consenso esplicito:</strong> per il trattamento dei dati sanitari (dati particolari).</li>
                <li><strong>Obbligo legale:</strong> per adempimenti fiscali e normativi.</li>
                <li><strong>Interesse legittimo:</strong> per la sicurezza della Piattaforma e la prevenzione delle frodi.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-senior-xl font-semibold mb-3">4. Finalità del Trattamento</h2>
              <p>I dati sono trattati per: (a) gestione dell'account e autenticazione; (b) intermediazione tra pazienti e professionisti; (c) elaborazione dei pagamenti tramite Stripe; (d) verifica dei titoli professionali; (e) comunicazioni relative al servizio; (f) adempimenti di legge.</p>
            </section>

            <section>
              <h2 className="text-senior-xl font-semibold mb-3">5. Conservazione dei Dati</h2>
              <p>I dati personali sono conservati per il tempo necessario alle finalità per cui sono raccolti, e comunque non oltre i termini previsti dalla legge. I dati relativi ai consensi sono conservati per fini di audit legale. I documenti di verifica professionale sono conservati per tutta la durata del rapporto con la Piattaforma.</p>
            </section>

            <section>
              <h2 className="text-senior-xl font-semibold mb-3">6. Condivisione dei Dati</h2>
              <p>I dati possono essere condivisi con: (a) Stripe, per l'elaborazione dei pagamenti; (b) fornitori di servizi cloud (Supabase) per l'hosting dei dati; (c) autorità competenti, ove richiesto dalla legge. I dati non sono venduti a terzi.</p>
            </section>

            <section>
              <h2 className="text-senior-xl font-semibold mb-3">7. Diritti dell'Interessato</h2>
              <p>In conformità agli articoli 15-22 del GDPR, l'utente ha diritto di: (a) accesso ai propri dati; (b) rettifica; (c) cancellazione ("diritto all'oblio"); (d) limitazione del trattamento; (e) portabilità dei dati; (f) opposizione; (g) revoca del consenso in qualsiasi momento. Per esercitare i propri diritti, contattare: privacy@comunicare.it.</p>
            </section>

            <section>
              <h2 className="text-senior-xl font-semibold mb-3">8. Sicurezza dei Dati</h2>
              <p>ComuniCARE adotta misure tecniche e organizzative adeguate per proteggere i dati personali, tra cui: crittografia dei dati in transito e a riposo, accesso basato su ruoli, bucket di archiviazione privati per i documenti sensibili, monitoraggio degli accessi.</p>
            </section>

            <section>
              <h2 className="text-senior-xl font-semibold mb-3">9. Cookie e Tecnologie di Tracciamento</h2>
              <p>La Piattaforma utilizza cookie tecnici necessari al funzionamento del servizio. Per cookie analitici o di profilazione, sarà richiesto il consenso esplicito dell'utente.</p>
            </section>

            <section>
              <h2 className="text-senior-xl font-semibold mb-3">10. Reclami</h2>
              <p>L'utente ha diritto di proporre reclamo all'Autorità Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
