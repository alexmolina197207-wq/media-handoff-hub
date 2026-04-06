import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-36 px-4">
      <div className="container mx-auto text-center max-w-3xl animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
          Share anything. Anywhere.<br />
          <span
            className="bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%]"
            style={{ backgroundImage: 'var(--gradient-hero)' }}
          >
            Privately.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Store, organize, and share files across any device with complete privacy.<br />
          No tracking, no ads, no compromise.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" onClick={() => navigate('/login')}>
            Start Sharing Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See How It Works
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-5">No signup required • Works on any device</p>
      </div>
    </section>
  );
}
