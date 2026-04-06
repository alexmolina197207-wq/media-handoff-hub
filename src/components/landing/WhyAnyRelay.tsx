import { EyeOff, ShieldCheck, Lock } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const reasons = [
  {
    icon: EyeOff,
    title: 'No tracking',
    desc: 'We don\'t track your files, your clicks, or your behavior. Ever.',
  },
  {
    icon: ShieldCheck,
    title: 'No ads',
    desc: 'Your data is never monetized. No banners, no upsell popups, no noise.',
  },
  {
    icon: Lock,
    title: 'Privacy-first design',
    desc: 'End-to-end encryption, access controls, and expiring links by default.',
  },
];

export default function WhyAnyRelay() {
  return (
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="why" className="py-24 px-4">
      <div className="container mx-auto max-w-4xl" ref={ref}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Why AnyRelay</h2>
          <p className="text-muted-foreground">Built different. On purpose.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className="rounded-2xl border border-border bg-card p-8 text-center shadow-card hover:shadow-elevated transition-shadow"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
                transitionDelay: `${i * 150}ms`,
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <r.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{r.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
