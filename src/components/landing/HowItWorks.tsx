import { Upload, Link2, Share2 } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload your file',
    desc: 'Drag and drop any file — images, videos, documents. It takes seconds.',
  },
  {
    icon: Link2,
    step: '02',
    title: 'Get a secure link',
    desc: 'We generate a private, encrypted link you control. Set expiry or password.',
  },
  {
    icon: Share2,
    step: '03',
    title: 'Share it instantly',
    desc: 'Send the link anywhere — any device, any platform. No account needed to view.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">How it works</h2>
          <p className="text-muted-foreground">Three steps. No friction.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-10 md:gap-12">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">
                Step {s.step}
              </span>
              <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
