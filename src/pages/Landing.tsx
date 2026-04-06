import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Upload, FolderOpen, Link2, BarChart3, Shield, Zap, Star, Check } from 'lucide-react';
import anyrelayLogo from '@/assets/anyrelay-logo.png';

const features = [
  { icon: Upload, title: 'Quick Upload', desc: 'Drag-drop any media file. Tag it, folder it, share it — in seconds.' },
  { icon: FolderOpen, title: 'Smart Folders', desc: 'Organize by platform, project, or purpose. Telegram, X, TikTok, Reels — all sorted.' },
  { icon: Link2, title: 'Share Links', desc: 'Generate instant share links with expiry controls and click tracking.' },
  { icon: BarChart3, title: 'Usage Analytics', desc: 'See what you share most, track storage, and monitor link activity.' },
  { icon: Shield, title: 'Access Controls', desc: 'Public, private, or password-protected. You decide who sees what.' },
  { icon: Zap, title: 'Cross-Platform', desc: 'Share across any network or device. Repost, repurpose, and reuse effortlessly.' },
];

const pricing = [
  { name: 'Free', price: '$0', period: '/mo', features: ['500 MB storage', '50 files', '5 share links', 'Basic folders', 'Community support'], cta: 'Start Free', popular: false },
  { name: 'Pro', price: '$12', period: '/mo', features: ['5 GB storage', 'Unlimited files', 'Unlimited share links', 'Collections & tags', 'Priority support', 'Analytics dashboard'], cta: 'Go Pro', popular: true },
  { name: 'Team', price: '$29', period: '/mo', features: ['50 GB storage', 'Team collaboration', 'Client drop zones', 'Custom branding', 'API access', 'Dedicated support'], cta: 'Contact Sales', popular: false },
];

const testimonials = [
  { name: 'Jordan K.', role: 'Content Creator', text: 'AnyRelay replaced three tools I was juggling. Upload once, share everywhere — it just works.', rating: 5 },
  { name: 'Priya S.', role: 'Social Media Manager', text: 'The folder system is exactly what I needed. Separate content per platform without the mess.', rating: 5 },
  { name: 'Marcus T.', role: 'Freelance Editor', text: 'Client drops are a game changer. They upload, I organize, we both win.', rating: 5 },
];

const faqs = [
  { q: 'What is AnyRelay?', a: 'AnyRelay is a private, secure file sharing platform. Share files across any network or device from one cloud-style library.' },
  { q: 'Is my data stored securely?', a: 'Yes. All files are encrypted at rest and in transit. Access controls let you set public, private, or password-protected permissions on every share link.' },
  { q: 'Can I use AnyRelay for team collaboration?', a: 'Absolutely. Our Team plan includes shared workspaces, client drop zones, and role-based access for your whole team.' },
  { q: 'What file formats are supported?', a: 'We support all major image formats (JPEG, PNG, WebP, GIF, SVG) and video formats (MP4, MOV, WebM). More coming soon.' },
  { q: 'How do share links work?', a: 'Generate a unique URL for any media file. Set an expiry date, access level, and track clicks. Recipients don\'t need an account to view.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <img src={anyrelayLogo} alt="AnyRelay" className="w-8 h-8" />
            <span className="font-bold text-lg text-foreground">AnyRelay</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log in</Button>
            <Button size="sm" onClick={() => navigate('/login')}>Start Demo <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto text-center max-w-3xl animate-fade-in">
          <Badge variant="secondary" className="mb-4">Now in public demo</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Share anything. Anywhere.<br />
            <span className="bg-clip-text text-transparent" style={{backgroundImage: 'var(--gradient-hero)'}}>Privately.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload, organize, and share files across every platform.
            AnyRelay is the fastest way to securely send and manage your content — no friction.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/login')}>
              Start Demo <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>
              See Features
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Everything you need for media handoff</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built for creators, marketers, and teams who move fast across platforms.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(f => (
              <Card key={f.title} className="shadow-card hover:shadow-elevated transition-shadow border-border bg-card">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map(p => (
              <Card key={p.name} className={`shadow-card relative border-border bg-card ${p.popular ? 'ring-2 ring-primary' : ''}`}>
                {p.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Most Popular</Badge>}
                <CardContent className="p-6 pt-8">
                  <h3 className="font-semibold text-foreground text-lg">{p.name}</h3>
                  <div className="mt-2 mb-4">
                    <span className="text-4xl font-bold text-foreground">{p.price}</span>
                    <span className="text-muted-foreground">{p.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-accent" />{f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={p.popular ? 'default' : 'outline'} onClick={() => navigate('/login')}>
                    {p.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Loved by creators & teams</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <Card key={t.name} className="shadow-card border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map(f => (
              <details key={f.q} className="group border border-border rounded-lg bg-card">
                <summary className="cursor-pointer p-4 font-medium text-foreground flex items-center justify-between">
                  {f.q}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to simplify your file sharing?</h2>
          <p className="text-muted-foreground mb-8">Try the demo — no signup required. See how AnyRelay makes secure file sharing effortless.</p>
          <Button size="lg" onClick={() => navigate('/login')}>
            Start Demo <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={anyrelayLogo} alt="AnyRelay" className="w-6 h-6" />
            <span>AnyRelay © 2025</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
