import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  ArrowRight, 
  Globe, 
  Zap, 
  Shield, 
  Code, 
  Check,
  CreditCard,
  Video,
  Link as LinkIcon,
  Languages,
  Layout,
  AppWindow,
  Settings,
  Star,
  Mail,
  Smartphone,
  Heart,
  Activity,
  Stethoscope,
  Search,
  FileText,
  QrCode,
  LayoutDashboard,
  BrainCircuit,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  Clock
} from 'lucide-react';

import { Footer7 } from './components/ui/footer-7';
import { TestimonialsColumn } from './components/ui/testimonials-columns-1';
import { CinematicFooter } from './components/ui/motion-footer';
import { FAQAccordionBlock } from './components/ui/faq-accordion-block-shadcnui';
import { HeroSection } from './components/ui/hero-section-shadcnui';
import { Dashboard } from './components/Dashboard';
import { Cta4 } from './components/ui/cta-4';
import { AnimatedLoginPage } from './components/ui/animated-characters-login-page';
import { Hero as CreativeHero } from './components/Hero';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PatientProfile from './pages/PatientProfile';

// --- Reusable Components ---

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: { 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'black'; 
  className?: string;
  [key: string]: any;
}) => {
  const { asChild, aschild, ...domProps } = props;
  const variants = {
    primary: 'cal-button-primary',
    secondary: 'cal-button-secondary',
    ghost: 'text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2 rounded-lg transition-all',
    black: 'bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all text-sm'
  };

  return (
    <button className={`${variants[variant]} ${className}`} {...domProps}>
      {children}
    </button>
  );
};

const Section = ({ children, className = '', id = '', container = true, animate = true }: { children: React.ReactNode; className?: string; id?: string; container?: boolean; animate?: boolean }) => (
  <section id={id} className={`py-16 md:py-24 ${className}`}>
    {container ? (
      <div className="max-w-[1200px] mx-auto px-6">
        {animate ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        ) : (
          children
        )}
      </div>
    ) : (
      children
    )}
  </section>
);

const Card = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => {
  const { asChild, aschild, ...domProps } = props;
  return (
    <div className={`cal-card ${className}`} {...domProps}>
      {children}
    </div>
  );
};

const Badge = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => {
  const { asChild, aschild, ...domProps } = props;
  return (
    <span className={`cal-badge ${className}`} {...domProps}>
      {children}
    </span>
  );
};

// --- Landing Page Sections ---

const Navbar = ({ onEnterApp }: { onEnterApp: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', id: 'features' },
    { name: 'How It Works', id: 'how-it-works' },
    { name: 'Testimonials', id: 'testimonials' },
    { name: 'FAQ', id: 'faq' },
    { name: 'CTA', id: 'cta' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offsetAtTop = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetAtTop, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-200 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-200' : 'bg-transparent'}`}>
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="text-xl font-bold tracking-tighter flex items-center gap-2 uppercase">
            <Smartphone size={20} fill="currentColor" /> CareSync
          </a>
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black px-3 py-2 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Button variant="black" onClick={onEnterApp}>Enter Portal <ArrowRight size={14} className="ml-1 inline" /></Button>
        </div>

        <button className="lg:hidden text-black" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4 overflow-hidden"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className="text-base font-medium text-gray-900 py-2 border-b border-gray-50"
              >
                {link.name}
              </a>
            ))}
            <Button variant="black" className="w-full" onClick={onEnterApp}>Go to app</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onEnterApp }: { onEnterApp: () => void }) => (
  <Section className="pt-12 pb-20">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-2">
          <Zap size={12} /> New Features Live <ChevronRight size={12} className="ml-1" />
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tighter">
          Reports to <span className="text-blue-600">Smart Timeline.</span>
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-[500px] leading-relaxed font-medium">
          Turn your medical reports into a structured health timeline and get personalized insurance suggestions instantly with AI.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-[500px]">
          <button 
            onClick={onEnterApp}
            className="flex-1 bg-black text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition-all uppercase tracking-widest text-xs shadow-2xl shadow-black/20"
          >
            Start Demo
          </button>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 bg-white text-gray-900 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-50 transition-all uppercase tracking-widest text-xs border border-gray-200"
          >
            View Features
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-6 font-black uppercase tracking-widest">Designed for hackathon 2026</p>
      </div>

      <div className="relative">
        <Card className="p-0 shadow-cal-lg border-gray-100 overflow-hidden">
          <div className="bg-white p-6 md:p-10">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                  <BrainCircuit size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">CareSync AI Engine</p>
                  <h3 className="text-xl font-black tracking-tight">Report Extraction</h3>
                </div>
              </div>
              <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-2 border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Processing</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Data Points', value: '42', icon: Activity },
                  { label: 'Risk Level', value: 'Medium', icon: ShieldCheck },
                  { label: 'Analysis', value: 'Complete', icon: CheckCircle },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                    <item.icon size={16} className="text-gray-400 mb-2" />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                    <p className="text-sm font-black">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
                <div className="relative group">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">10:30 AM • APR 24</p>
                  <h4 className="text-sm font-black mb-1">Blood Work Analyzed</h4>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">Detected elevated Glucose levels. Syncing with insurance...</p>
                </div>

                <div className="relative group opacity-60">
                   <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">09:15 AM • APR 24</p>
                  <h4 className="text-sm font-black mb-1">Report Uploaded</h4>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">Encrypted medical PDF processed via CareSync Secure Channel.</p>
                </div>
              </div>

              <div className="pt-4">
                <div className="p-4 bg-black text-white rounded-2xl shadow-xl shadow-black/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-blue-400" />
                    <div>
                      <p className="text-[9px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">Insurance Optimization</p>
                      <p className="text-xs font-bold">Switch to Plan #8421</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/40" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Floating Badges */}
        <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-8 opacity-60">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-green-500 fill-green-500" />
            <span className="text-sm font-bold">Trustpilot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">P</div>
            <span className="text-sm font-bold">Product Hunt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">G</div>
            <span className="text-sm font-bold">G2</span>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

const Stats = () => (
  <div className="py-12 bg-white border-y border-gray-100 overflow-hidden">
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false }}
      transition={{ duration: 1 }}
      className="max-w-[1200px] mx-auto px-6 flex flex-wrap justify-between items-center gap-8"
    >
      {[
        { label: "Report Analyzer", icon: <FileText size={20} /> },
        { label: "Health Timeline", icon: <Clock size={20} /> },
        { label: "Insurance Suggestions", icon: <ShieldCheck size={20} /> }
      ].map((stat, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-black shadow-sm">
            {stat.icon}
          </div>
          <span className="text-xs font-black uppercase tracking-widest">{stat.label}</span>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

const HowItWorks = () => (
  <Section id="features" className="bg-gray-50/50">
    <div className="text-center mb-16 px-4">
      <Badge className="mb-4 bg-white px-4 py-1.5 border-gray-100 uppercase tracking-[0.2em] font-black text-[9px] text-gray-400">The CareSync Ecosystem</Badge>
      <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter leading-tight">Smart. Structured. Secure.</h2>
      <p className="text-gray-400 text-lg max-w-[600px] mx-auto font-medium">
        Our AI extracts clinical data from raw reports to build your medical story and suggest the best coverage.
      </p>
    </div>

    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
      {[
        { 
          title: 'Report Analyzer', 
          desc: "Upload any PDF or image. AI extracts conditions, allergies, and medications instantly.",
          icon: <FileText className="h-6 w-6" />
        },
        { 
          title: 'Health Timeline', 
          desc: "A chronological medical history generated from your reports for better doctor visits.",
          icon: <Clock className="h-6 w-6" />
        },
        { 
          title: 'Insurance Suggestions', 
          desc: "Get personalized plan recommendations based on your risk profile and health history.",
          icon: <ShieldCheck className="h-6 w-6" />
        },
        { 
          title: 'QR Health Profile', 
          desc: "Share your structured health data with specialists securely via a portable QR code.",
          icon: <QrCode className="h-6 w-6" />
        }
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          <Card className="p-8 flex flex-col h-full hover:scale-[1.02] transition-all border-none shadow-xl shadow-black/5 bg-white">
            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/10">
              {item.icon}
            </div>
            <h3 className="text-xl font-black mb-4 tracking-tight">{item.title}</h3>
            <p className="text-gray-400 text-xs mb-10 leading-relaxed font-bold uppercase tracking-widest">{item.desc}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  </Section>
);

const Benefits = () => (
  <Section id="how-it-works" className="bg-white">
    <div className="text-center mb-16 px-4">
      <Badge className="mb-4 bg-gray-50 uppercase tracking-widest font-black text-[9px] px-4 py-2">The CareSync Edge</Badge>
      <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">Why trust CareSync?</h2>
      <p className="text-gray-400 text-lg max-w-[600px] mx-auto font-medium">
        We've engineered the perfect balance between clinical efficiency and patient-first care.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="p-10 border-none shadow-2xl shadow-black/5 bg-white hover:scale-[1.01] transition-all h-full">
          <h3 className="text-2xl font-black mb-4 tracking-tighter">AI-Driven Risk Analysis</h3>
          <p className="text-gray-400 text-sm mb-10 leading-relaxed font-bold uppercase tracking-widest">Stop guessing which insurance you need. Our AI maps your history to the perfect plan based on clinical risk markers.</p>
          <div className="bg-gray-50 rounded-[2rem] border border-gray-100 p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 font-black">Risk Profiles</p>
            <div className="space-y-4">
              <div>
                <div className="bg-white border border-gray-200 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-between items-center shadow-sm">
                  LOW RISK PROFILING <ShieldCheck size={14} className="text-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-between items-center shadow-sm">
                  MEDIUM <Shield size={14} className="text-amber-500" />
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-between items-center shadow-sm">
                  CRITICAL <Shield size={14} className="text-rose-500" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="p-10 border-none shadow-2xl shadow-black/5 bg-white hover:scale-[1.01] transition-all h-full">
          <h3 className="text-2xl font-black mb-4 tracking-tighter">Chronological Health Timeline</h3>
          <p className="text-gray-400 text-sm mb-10 leading-relaxed font-bold uppercase tracking-widest">Medical data is better when visual. We convert thousands of lines of lab data into a clean, vertical medical story.</p>
          <div className="bg-gray-50 rounded-[2rem] border border-gray-100 p-8 relative overflow-hidden">
            <div className="flex bg-white p-5 rounded-2xl shadow-xl border border-gray-100 items-center gap-5">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Timeline Extracted</p>
                <p className="text-xs font-black tracking-tight">"3 Diagnoses, 12 Labs detected."</p>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              {['Oct 12', 'Dec 05', 'Jan 20'].map(t => <span key={t} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">{t}</span>)}
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="p-10 border-none shadow-2xl shadow-black/5 bg-white hover:scale-[1.01] transition-all h-full">
          <h3 className="text-2xl font-black mb-4 tracking-tighter">Insurance Eligibility Check</h3>
          <p className="text-gray-400 text-sm mb-10 leading-relaxed font-bold uppercase tracking-widest">Are you eligible for a premium reduction? AI checks your wellness trends to suggest savings on your next renewal.</p>
          <div className="bg-gray-50 rounded-[2rem] border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-4 bg-emerald-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-all" /></div>
                <span className="text-[10px] font-black uppercase tracking-widest">AI Scoring Active</span>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className={`h-16 rounded-xl border mb-2 shadow-sm flex items-center justify-center ${i < 4 ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-white border-gray-100 text-gray-200'}`}>
                    {i < 4 ? <CheckCircle size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-gray-100" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="p-10 border-none shadow-2xl shadow-black/5 bg-white hover:scale-[1.01] transition-all h-full">
          <h3 className="text-2xl font-black mb-4 tracking-tighter">Secure Doctor Communication</h3>
          <p className="text-gray-400 text-sm mb-10 leading-relaxed font-bold uppercase tracking-widest">Communicate with your care providers through an encrypted channel, sharing records and updates instantly when needed.</p>
          <div className="bg-gray-50 rounded-[2rem] border border-gray-100 p-8 flex items-center justify-center">
            <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-5 w-full">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10"><MessageSquare size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Encrypted Chat</p>
                <p className="text-xs font-black tracking-tight">"Dr. Sarah Johnson shared a prescription."</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  </Section>
);

const MoreFeatures = () => (
  <Section className="bg-gray-50/50">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-extrabold mb-6 tracking-tighter">Advanced Health Tech</h2>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { icon: <FileText size={20} />, title: 'Report Analyzer' },
        { icon: <Clock size={20} />, title: 'History Timeline' },
        { icon: <ShieldCheck size={20} />, title: 'Insurance Logic' },
        { icon: <ShieldCheck size={20} />, title: 'GDPR / HIPAA Ready' },
        { icon: <BrainCircuit size={20} />, title: 'Risk Indicators' },
        { icon: <BrainCircuit size={20} />, title: 'AI Summaries' },
        { icon: <Activity size={20} />, title: 'Lab Extraction' },
        { icon: <QrCode size={20} />, title: 'Health Identity' },
      ].map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
        >
          <Card className="p-8 border-none shadow-xl shadow-black/5 bg-white flex flex-col items-center text-center hover:scale-[1.05] transition-all cursor-pointer">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-black">
              {item.icon}
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest">{item.title}</h4>
          </Card>
        </motion.div>
      ))}
    </div>
  </Section>
);

const Testimonials = () => {
  const testimonials = [
    {
      text: "CareSync turned my messy box of medical folders into a clean digital timeline. The insurance suggestion helped me save $150 a month.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
      name: "Briana Patton",
      role: "Patient",
    },
    {
      text: "Viewing a patient's chronological history instead of digging through PDFs is a game-changer. The AI extraction is surprisingly accurate.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
      name: "Dr. Bilal Ahmed",
      role: "General Physician",
    },
    {
      text: "I used to spend hours comparing insurance plans. CareSync suggested the perfect 'Standard Plus' plan based on my actual health data.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
      name: "Saman Malik",
      role: "User",
    },
    {
      text: "Security and privacy were my main concerns. CareSync's encryption standards gave me the confidence to move my records online.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
      name: "Omar Raza",
      role: "Health Advocate",
    },
    {
      text: "The AI summary is incredibly accurate. It highlights exactly what I need to know about the patient's history immediately.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150",
      name: "Dr. Zainab Hussain",
      role: "Cardiologist",
    },
    {
      text: "Universal healthcare portability is finally here. I can travel abroad without worrying about my medical files.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150",
      name: "Aliza Khan",
      role: "Frequent Traveler",
    },
  ];

  const firstColumn = testimonials.slice(0, 2);
  const secondColumn = testimonials.slice(2, 4);
  const thirdColumn = testimonials.slice(4, 6);

  return (
    <Section id="testimonials" className="bg-white overflow-hidden">
      <div className="text-center mb-16">
        <Badge className="mb-4">Testimonials</Badge>
        <h2 className="text-4xl md:text-5xl font-bold mb-6">What our users say</h2>
        <p className="text-gray-500 text-lg max-w-[600px] mx-auto">
          See what our customers have to say about us.
        </p>
      </div>

      <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
        <TestimonialsColumn testimonials={firstColumn} duration={15} />
        <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
        <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
      </div>
    </Section>
  );
};

const AppStore = () => (
  <Section className="bg-gray-50/50">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-6 bg-white border-gray-100 uppercase tracking-[0.2em] font-black text-[9px] px-4 py-2">Ecosystem</Badge>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Sync with your hospital's stack</h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed font-medium">
            CareSync works with all modern EMR and health tracking platforms through secure, standardized interfaces.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-4 gap-4"
        >
          {[
            'https://www.google.com/favicon.ico',
            'https://www.salesforce.com/favicon.ico',
            'https://www.microsoft.com/favicon.ico',
            'https://www.zoom.us/favicon.ico',
            'https://www.slack.com/favicon.ico',
            'https://www.hubspot.com/favicon.ico',
            'https://www.stripe.com/favicon.ico',
            'https://www.zapier.com/favicon.ico'
          ].map((icon, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-white p-6 rounded-2xl shadow-cal border border-gray-100 flex items-center justify-center"
            >
              <img src={icon} className="w-8 h-8 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" alt="" />
            </motion.div>
          ))}
        </motion.div>
      </div>
  </Section>
);

const FinalCTA = ({ onEnterApp }: { onEnterApp: () => void }) => (
  <Cta4
    title="Your history, structured."
    description="Experience the future of medical record management. Get your smart timeline and insurance suggestions today."
    buttonText="Enter Portal"
    buttonOnClick={onEnterApp}
    items={[
      "Report Analyzer",
      "Health Timeline",
      "Insurance suggestions",
      "QR Profile Sharing",
      "Secure AI Analysis"
    ]}
  />
);

const Footer = () => (
  <footer className="py-12 border-t border-gray-100 bg-white">
    <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-tighter">
        <Smartphone size={16} /> CareSync
      </div>
      <p className="text-xs text-gray-400 font-medium tracking-tight">© 2026 CareSync. All rights reserved.</p>
      <div className="flex gap-6">
        {['Privacy', 'Terms', 'Contact'].map(l => (
          <a key={l} href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">{l}</a>
        ))}
      </div>
    </div>
  </footer>
);

const LandingPage = ({ onEnterApp }: { onEnterApp: () => void }) => (
  <div className="min-h-screen bg-white">
    <Navbar onEnterApp={onEnterApp} />
    <main>
      <CreativeHero />
      <Stats />
      <HowItWorks />
      <Benefits />
      <MoreFeatures />
      <Testimonials />
      <div id="faq">
        <FAQAccordionBlock />
      </div>
      <div id="pricing">
        <div id="cta">
          <FinalCTA onEnterApp={onEnterApp} />
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

// --- Start Page Component ---

const StartPage = ({ onStart }: { onStart: () => void }) => (
  <div className="relative w-full bg-white min-h-screen font-sans selection:bg-black/20 overflow-x-hidden">
    {/* Main Content Area */}
    <main className="relative z-10 w-full min-h-[120vh] bg-white flex flex-col items-center justify-center text-black border-b border-black/10 shadow-2xl rounded-b-[3rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(0,0,0,0.03)_0%,transparent_60%)] pointer-events-none" />
      <HeroSection onStart={onStart} />
    </main>

    {/* The Cinematic Footer is revealed underneath */}
    <CinematicFooter onStart={onStart} />
  </div>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'start' | 'landing' | 'login' | 'dashboard'>('start');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setView('dashboard');
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setView('dashboard');
      } else if (event === 'SIGNED_OUT') {
        setView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Reset scroll to top when view changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [view]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Initializing CareSync</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/patient/:id" element={<PatientProfile />} />
        <Route path="*" element={
          <AnimatePresence mode="wait">
            {view === 'start' && (
              <motion.div
                key="start"
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <StartPage onStart={() => setView('landing')} />
              </motion.div>
            )}
            {view === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
              >
                <LandingPage onEnterApp={() => setView('login')} />
              </motion.div>
            )}
            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <AnimatedLoginPage onLoginSuccess={() => setView('dashboard')} />
              </motion.div>
            )}
            {view === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Dashboard />
              </motion.div>
            )}
          </AnimatePresence>
        } />
      </Routes>
    </BrowserRouter>
  );
}
