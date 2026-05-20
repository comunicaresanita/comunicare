import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { articles } from "@/data/blogArticles";

const Blog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Blog ComuniCARE — Approfondimenti sull'assistenza domiciliare"
        description="Articoli e approfondimenti su assistenza infermieristica, fisioterapia e supporto socio-sanitario a domicilio."
        path="/blog"
      />
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

export default Blog;
