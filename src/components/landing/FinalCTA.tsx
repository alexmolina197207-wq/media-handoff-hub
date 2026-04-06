import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Start sharing in seconds
        </h2>
        <p className="text-muted-foreground mb-10">
          No signup required. No credit card. Just private, secure file sharing.
        </p>
        <Button size="lg" onClick={() => navigate('/login')}>
          Start Sharing Free <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
