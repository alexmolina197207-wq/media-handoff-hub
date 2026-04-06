import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

export default function FinalCTA() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 px-4">
      <div
        ref={ref}
        className="container mx-auto max-w-2xl text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.6s ease-out',
        }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Start sharing in seconds
        </h2>
        <p className="text-muted-foreground mb-10">
          No signup required. No credit card. Just private, secure file sharing.
        </p>
        <Button size="lg" onClick={() => navigate('/app')}>
          Start Sharing Free <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
