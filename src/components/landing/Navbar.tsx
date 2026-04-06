import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import anyrelayLogo from '@/assets/anyrelay-logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <img src={anyrelayLogo} alt="AnyRelay" className="w-8 h-8" />
          <span className="font-bold text-lg text-foreground">AnyRelay</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#why" className="hover:text-foreground transition-colors">Why AnyRelay</a>
          <a href="#use-cases" className="hover:text-foreground transition-colors">Use Cases</a>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate('/login')}>Log in</Button>
          <Button size="sm" onClick={() => navigate('/login')}>
            <span className="hidden sm:inline">Start Sharing Free</span>
            <span className="sm:hidden">Start Free</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
