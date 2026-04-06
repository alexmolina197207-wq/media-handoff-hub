import { Smartphone, FileText, Image, Users } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const cases = [
  {
    icon: Smartphone,
    title: 'Share files between devices',
    desc: 'Move photos, videos, and documents between your phone, tablet, and desktop seamlessly.',
  },
  {
    icon: FileText,
    title: 'Send private documents',
    desc: 'Share contracts, invoices, or personal files with password protection and expiry dates.',
  },
  {
    icon: Image,
    title: 'Transfer media',
    desc: 'Send high-resolution images and videos without compression or quality loss.',
  },
  {
    icon: Users,
    title: 'Collaborate securely',
    desc: 'Work with clients and teammates through shared folders and controlled access.',
  },
];

export default function UseCases() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="use-cases" className="py-24 bg-muted/30 px-4">
      <div className="container mx-auto max-w-4xl" ref={ref}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Built for real use cases</h2>
          <p className="text-muted-foreground">However you share, AnyRelay fits right in.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {cases.map((c, i) => (
            <div
              key={c.title}
              className="flex gap-5 items-start rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-shadow"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <c.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
