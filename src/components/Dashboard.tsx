import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Home, 
  Search, 
  Bell, 
  User, 
  MessageSquare, 
  Clock, 
  Plus, 
  Calendar,
  Activity,
  Heart,
  FileText,
  Stethoscope,
  PhoneCall,
  Star,
  CheckCircle,
  MapPin,
  ChevronRight,
  Video,
  X,
  Shield,
  Send,
  Zap,
  Check,
  AlertCircle,
  QrCode,
  LayoutDashboard,
  BrainCircuit,
  Smartphone,
  Layout,
  Settings,
  HelpCircle,
  ShieldCheck,
  Construction,
  LogOut,
  List,
  Wallet
} from 'lucide-react';
import { insurancePlans } from '../lib/insuranceData';
import { Timeline } from './ui/modern-timeline';
import FileUpload from './ui/file-upload';
import OnboardingForm from './OnboardingForm';
import { analyzeMedicalReport, getAIResponse } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';
import { cn } from '../lib/utils';

const safeDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "Recent" : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const getAge = (dobString: string | undefined) => {
  if (!dobString) return 30; // Default fallback for demo
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// --- Types ---
interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: 'pending' | 'taken' | 'missed';
}

interface PatientRecord {
  id: string;
  date: string;
  doctor: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
}

interface PatientData {
  id: string;
  name: string;
  age: string;
  gender: string;
  phone: string;
  email?: string;
  blood_group?: string;
  allergies?: string | string[];
  chronic_diseases?: string | string[];
  dob?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  height?: string;
  weight?: string;
  medications?: string;
}

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={`bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, className = '', variant = 'neutral' }: { children: React.ReactNode; className?: string; variant?: 'neutral' | 'success' | 'danger' | 'warning' | 'primary'; [key: string]: any }) => {
  const variants = {
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    danger: 'bg-rose-50 text-rose-600 border-rose-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    primary: 'bg-blue-50 text-blue-600 border-blue-100',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'; className?: string; disabled?: boolean }) => {
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200',
    outline: 'bg-white text-black border border-gray-200 hover:border-black',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200',
    ghost: 'hover:bg-gray-100 text-gray-500 hover:text-black',
  };
  
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

function parseAIResponse(text: string) {
  const sections = {
    summary: "",
    actions: [] as string[],
    warnings: [] as string[]
  };

  const lines = text.split("\n");
  let current: 'summary' | 'actions' | 'warnings' | '' = "";

  lines.forEach(line => {
    const clean = line.trim();
    if (!clean) return;

    const lower = clean.toLowerCase();
    if (lower.includes("summary:")) current = "summary";
    else if (lower.includes("what you can do:")) current = "actions";
    else if (lower.includes("when to seek help:")) current = "warnings";
    else {
      if (current === "summary") sections.summary += clean + " ";
      if (current === "actions") sections.actions.push(clean.replace(/^[*-]\s*/, "").trim());
      if (current === "warnings") sections.warnings.push(clean.replace(/^[*-]\s*/, "").trim());
    }
  });

  return sections;
}

// --- Main Application ---
export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyzer' | 'timeline' | 'insurance' | 'chat' | 'profile' | 'settings'>('dashboard');
  const [insuranceFilter, setInsuranceFilter] = useState('All');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [view, setView] = useState<'registration' | 'patient'>('registration');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [healthOverview, setHealthOverview] = useState({
    conditions: [],
    allergies: [],
    reportsCount: 0,
    riskLevel: 'Low' as 'Low' | 'Medium' | 'High'
  });
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [analyzedRecords, setAnalyzedRecords] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Hello! I am your CareSync AI Analyst. I can help you understand your medical reports and health timeline. What would you like to know?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const profileUrl = `${window.location.origin}/patient/${patientData?.id}`;
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [selectedTimelineReport, setSelectedTimelineReport] = useState<any | null>(null);
  const [qrFormat, setQrFormat] = useState<'json' | 'url'>('url');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const addNotification = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const [reports, setReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const calculateTrend = (currentRisk: string, previousRisk?: string) => {
    const riskMap: Record<string, number> = { 'Low': 1, 'Medium': 2, 'High': 3 };
    if (!previousRisk) return 'stable';
    const curr = riskMap[currentRisk] || 1;
    const prev = riskMap[previousRisk] || 1;
    if (curr > prev) return 'up';
    if (curr < prev) return 'down';
    return 'stable';
  };

  const fetchReports = async (userId: string) => {
    // Step 10: Ensure User Exists
    if (!userId) {
      console.error("User ID not found for fetching reports");
      return;
    }
    
    setIsLoadingReports(true);
    try {
      // Step 6: Fix Fetch Query (Remove Broken Filters)
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        setReports([]);
        return;
      }

      if (data) {
        console.log("📊 FETCHED REPORTS:", data.length);
        setReports([]); // Clear old state to force reset
        setReports([...data]); // Force re-render with new array copy
        
        // Update Health Overview from all reports
        const reportConditions = data.flatMap(r => normalizeData(r.conditions || [])).map(c => c.name);
        
        const latestRisk = data.length > 0 ? data[0].risk_level : 'Low';
        
        setHealthOverview(prev => {
          // Merge report conditions with existing ones (from profile)
          const mergedConditions = [...new Set([...prev.conditions, ...reportConditions])];
          return {
            ...prev,
            conditions: mergedConditions.length > 0 ? mergedConditions as any : prev.conditions,
            reportsCount: data.length,
            riskLevel: latestRisk as any
          };
        });

        // Transform and calculate trends
        let fetchedEvents = data.map((report, idx) => {
          const prevReport = idx > 0 ? data[idx-1] : null;
          return {
            id: report.id,
            date: formatDate(report.created_at),
            created_at: report.created_at,
            title: safeString(report.conditions?.[0]) || "Medical Report Analysis",
            type: 'report' as const,
            desc: report.summary,
            description: report.summary, // Added for Timeline component
            status: 'completed' as const,
            isReal: true,
            risk_level: report.risk_level,
            trend: calculateTrend(report.risk_level, prevReport?.risk_level),
            reportData: {
              summary: report.summary,
              conditions: report.conditions,
              medications: report.medications,
              tests: report.tests,
              risk_level: report.risk_level
            },
            onClick: (reportData: any) => {
              setSelectedTimelineReport(reportData);
              // Update Chat Context
              setChatHistory(prev => [...prev, { 
                sender: 'ai', 
                text: `I've opened the insights for your ${report.conditions?.[0] || 'report'}. Based on this, your risk level is ${report.risk_level}. Would you like me to explain any specific part of this summary?` 
              }]);
            }
          };
        });

        setTimelineEvents(fetchedEvents); // Latest already first from SQL order
      }
    } catch (err) {
      console.error("Critical fetch error:", err);
      setReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    if (patientData?.id) {
      fetchReports(patientData.id);
    }
  }, [patientData?.id]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile && !error) {
          setPatientData({
            id: profile.id,
            name: profile.full_name || 'User',
            age: (profile.age || '').toString(),
            gender: profile.gender || '',
            phone: profile.phone_number || '',
            email: profile.email || user.email,
            blood_group: profile.blood_group,
            allergies: profile.allergies || [],
            chronic_diseases: profile.chronic_diseases || [],
            dob: profile.date_of_birth,
            address: profile.address,
            emergency_contact_name: profile.emergency_contact_name,
            emergency_contact_phone: profile.emergency_contact_phone,
            height: profile.height,
            weight: profile.weight,
            medications: profile.medications
          });

          if (profile.chronic_diseases || profile.allergies) {
             const profileConditions = profile.chronic_diseases ? (Array.isArray(profile.chronic_diseases) ? profile.chronic_diseases : profile.chronic_diseases.split(',').map((s: any) => s.trim())) : [];
             const profileAllergies = profile.allergies ? (Array.isArray(profile.allergies) ? profile.allergies : profile.allergies.split(',').map((s: any) => s.trim())) : [];
             
             setHealthOverview(prev => ({
               ...prev,
               conditions: profileConditions.length > 0 ? profileConditions : prev.conditions,
               allergies: profileAllergies.length > 0 ? profileAllergies : prev.allergies,
             }));
          }

          setView('patient');
        }
      }
    };
    checkUser();
  }, []);

  const handleRegister = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found.");

      // 1. Prepare payload with snake_case fields matching DB
      const payload = {
        id: user.id,
        full_name: data.fullName || "",
        date_of_birth: data.dob || null,
        age: Number(data.age) || null,
        gender: data.gender || "",
        phone_number: data.phone || "",
        address: data.address || "",
        
        blood_group: data.bloodGroup || "",
        allergies: data.allergies || "",
        chronic_diseases: data.chronicDiseases || "",
        past_medical_history: data.pastDiseases || "",
        current_medications: data.currentMedications || "",
        
        smoking: data.smoking === 'yes',
        alcohol_consumption: data.alcohol === 'yes',
        exercise_frequency: data.exerciseFrequency || "",
        height_cm: Number(data.height) || null,
        weight_kg: Number(data.weight) || null,
        
        emergency_contact_name: data.emergencyName || "",
        emergency_contact_phone: data.emergencyPhone || "",
        family_medical_history: data.familyHistory || "",
        ongoing_treatments: data.ongoingTreatments || "",
        email: user.email // Included for internal identification
      };
      
      // 2. Update health overview in UI immediately (Optimistic UI)
      setHealthOverview(prev => ({
        ...prev,
        conditions: data.chronicDiseases ? data.chronicDiseases.split(',').map((s: string) => s.trim()) : prev.conditions,
        allergies: data.allergies ? data.allergies.split(',').map((s: string) => s.trim()) : prev.allergies,
      }));

      // 3. Safe Insert into Supabase
      const { error } = await supabase.from('users').upsert(payload);

      if (error) {
        console.error("Supabase Insert Error:", error);
        alert(`Database Sync Failed: ${error.message}`);
        // Do not proceed to dashboard if we want to ensure data is saved
        return;
      }

      addNotification('Profile saved successfully! Welcome to CareSync.');

      // 4. Update local state and view
      setPatientData({
        id: user.id,
        name: payload.full_name,
        age: (payload.age || '').toString(),
        gender: payload.gender,
        phone: payload.phone_number,
        email: user.email,
        blood_group: payload.blood_group,
        allergies: payload.allergies,
        chronic_diseases: payload.chronic_diseases
      });
      setView('patient');

    } catch (error: any) {
      console.error("Critical registration error:", error);
      addNotification(error.message || "Something went wrong.");
      
      // Even on critical error, don't block the user in a demo environment if we have some data
      if (data.fullName) {
        setView('patient');
      }
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      addNotification("Logout failed.");
    } else {
      setPatientData(null);
      setView('registration');
    }
  };

  const handleMarkTaken = (id: string, status: 'taken' | 'missed') => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    addNotification(`Medicine marked as ${status}.`);
  };

  const generateAiSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      if (healthOverview.reportsCount === 0) {
        setAiSummary("No medical reports found to analyze. Please upload your reports to generate a comprehensive health summary.");
      } else {
        const prompt = `Generate a brief clinical summary for a patient with the following profile:
          Conditions: ${healthOverview.conditions.join(', ')}
          Allergies: ${healthOverview.allergies.join(', ')}
          Risk Level: ${healthOverview.riskLevel}
          Number of Reports: ${healthOverview.reportsCount}
          
          Provide a concise, professional assessment (2-3 sentences).`;
        
        const response = await getAIResponse(prompt);
        setAiSummary(response);
        addNotification("AI Health Summary updated.");
      }
    } catch (err) {
      setAiSummary("Unable to generate AI summary at this moment. Please check your data or try again later.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const sendReminder = (medicineName: string) => {
    addNotification(`WhatsApp Reminder Sent for ${medicineName}!`);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || isTyping) return;
    
    const userMsg = chatInput.trim();
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);
    
    try {
      const systemPrompt = `You are a healthcare assistant.
STRICT RULES:
- Use ONLY plain text (no markdown, no **, no symbols like •)
- Use "-" for bullet points
- Keep responses short and structured
- Maximum 5 sections
- Each section max 2 lines
- No paragraphs, no emojis, no extra commentary

Always respond in this EXACT format:

Condition Overview: <short sentence>

Common Causes:
- cause 1
- cause 2

What You Can Do:
- action 1
- action 2

Warning Signs:
- sign 1
- sign 2

When to Seek Help:
- condition

If the response is not in the exact format above, it is invalid.`;

      const healthContext = `
        Patient: ${patientData?.name}
        Age: ${patientData?.dob ? getAge(patientData.dob) : patientData?.age}
        Conditions: ${healthOverview.conditions.join(', ')}
        Allergies: ${healthOverview.allergies.join(', ')}
        Recent Risk Level: ${healthOverview.riskLevel}
      `.trim();

      const combinedPrompt = `${systemPrompt}\n\nUser Query:\n${userMsg}`;
      const response = await getAIResponse(combinedPrompt, healthContext);
      
      // Simulate realistic typing delay
      setTimeout(() => {
        setChatHistory(prev => [...prev, { sender: 'ai', text: response }]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { sender: 'ai', text: "Please consult a doctor for accurate advice." }]);
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Step 5: Request Lock (Critical)
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    addNotification("AI is starting analysis...");
    
    try {
      // Step 3: File Name Sanitization
      const cleanName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .replace(/\s+/g, "_")
        .slice(0, 80);

      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';

      if (!isImage && !isPDF) {
        throw new Error("Only images and PDFs are supported.");
      }

      let fileToProcess: File = file;
      if (isImage) {
        try {
          const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1280, useWebWorker: true };
          fileToProcess = await imageCompression(file, options) as File;
        } catch (compErr) {
          fileToProcess = file;
        }
      }

      // Step 4: Supabase Storage Fix
      let fileUrl = "";
      if (patientData) {
        const filePath = `${patientData.id}/${Date.now()}-${cleanName}`;
        try {
          const { error: uploadError } = await supabase.storage
            .from("reports")
            .upload(filePath, fileToProcess, {
              cacheControl: "3600",
              upsert: false
            });

          if (uploadError) {
            console.error("Upload failed:", uploadError);
            if (uploadError.message?.includes('duplicate')) {
              const { data } = supabase.storage.from('reports').getPublicUrl(filePath);
              fileUrl = data.publicUrl;
            } else {
              throw new Error("Storage upload failed.");
            }
          } else {
            const { data } = supabase.storage.from('reports').getPublicUrl(filePath);
            fileUrl = data.publicUrl;
          }

          if (!fileUrl) {
            throw new Error("File URL generation failed.");
          }
        } catch (storageErr) {
          console.error("Storage Error:", storageErr);
          throw storageErr;
        }
      }

      // AI Analysis
      const analysis = await analyzeMedicalReport(fileToProcess);
      setAnalysisResult(analysis);
      
      // Step 4: Fix State Sync (Safe Mapping)
      setHealthOverview(prev => ({
        ...prev,
        conditions: [...new Set([...prev.conditions, ...(analysis.conditions?.map(c => typeof c === 'string' ? c : c.name) || [])])],
        reportsCount: prev.reportsCount + 1,
        riskLevel: analysis.risk_level
      }));

      // 4. Update state and timeline
      const newReportEvent = {
        date: safeDate(analysis.dates?.[0] || new Date().toISOString()),
        created_at: new Date().toISOString(),
        title: file.name,
        type: 'report' as const,
        desc: analysis.summary,
        status: 'completed' as const,
        reportData: analysis
      };

      // Add granular events from AI extraction
      const granularEvents = (analysis.events || []).map((e: any) => ({
        date: safeDate(e.date || new Date().toISOString()),
        created_at: new Date().toISOString(),
        title: e.title || e.type,
        type: (e.type?.toLowerCase() === 'prescription' ? 'prescription' : e.type?.toLowerCase() === 'test' ? 'test' : 'report') as any,
        desc: e.desc,
        status: 'completed' as const
      }));

      const allNewEvents = [newReportEvent, ...granularEvents];
      setTimelineEvents(prev => [...allNewEvents, ...prev]);

      // Step 5: Supabase Insert Fix (JSONB Safe)
      if (patientData) {
        const payload = {
          user_id: patientData.id,
          title: cleanName,
          file_url: fileUrl,
          summary: analysis.summary || "Medical report analysis",
          risk_level: (analysis.risk_level || "Low").toLowerCase(),
          conditions: analysis.conditions || [],
          medications: analysis.medications || [],
          tests: analysis.tests || [],
          dates: analysis.dates || [],
          created_at: new Date().toISOString()
        };

        console.log("📦 FINAL INSERT:", payload);
        const { data: insertData, error: insertError } = await supabase.from('reports').insert([payload]).select();

        if (insertError) {
          console.error("Insert error:", insertError);
        } else {
          console.log("✅ INSERT SUCCESS:", insertData);
          addNotification("Report analyzed and saved to timeline.");
          await fetchReports(patientData.id); // Await refresh to ensure state sync
        }
      }

      addNotification("Analysis complete!");
      
    } catch (error) {
      console.error("Pipeline Error:", error);
      addNotification("Analysis failed. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const takenCount = medicines.filter(m => m.status === 'taken').length;
  const adherenceRate = medicines.length > 0 ? Math.round((takenCount / medicines.length) * 100) : 0;

  return (
    <>
      <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-black/5 flex">
        {/* Toast Notifications */}
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-2">
          <AnimatePresence>
            {notifications.map(n => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="bg-black text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
              >
                <Zap className="text-amber-400" size={18} fill="currentColor" />
                <span className="text-xs font-bold leading-none">{n.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sidebar - Only shown in Patient View after registration */}
        {patientData && (
          <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} border-r border-gray-100 flex flex-col bg-white sticky top-0 h-screen transition-all duration-300 ease-in-out`}>
            <div className={`p-8 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                <Activity className="text-white" size={20} />
              </button>
              {!isSidebarCollapsed && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <h1 className="text-lg font-black tracking-tighter">CareSync</h1>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Healthy Living</p>
                </motion.div>
              )}
            </div>

            <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto no-scrollbar">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'analyzer', label: 'Report Analyzer', icon: FileText },
                { id: 'timeline', label: 'Health Timeline', icon: Clock },
                { id: 'insurance', label: 'Insurance Plans', icon: ShieldCheck },
                { id: 'chat', label: 'Chatbox', icon: MessageSquare },
                { id: 'profile', label: 'Health Profile', icon: User },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                    activeTab === item.id 
                      ? 'bg-black text-white shadow-xl shadow-black/10' 
                      : 'hover:bg-gray-100 text-gray-500 hover:text-black'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-black'} />
                  {!isSidebarCollapsed && (
                    <span className="text-[11px] font-black uppercase tracking-widest truncate">{item.label}</span>
                  )}
                </button>
              ))}
            </nav>

            {!isSidebarCollapsed && (
              <div className="p-8">
                <Card className="p-6 bg-gray-50 border-none">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Patient Support</p>
                  <Button variant="outline" className="w-full text-[10px] h-10 font-black rounded-xl border-gray-200">
                    GET HELP
                  </Button>
                </Card>
              </div>
            )}

            <div className="p-6 border-t border-gray-50 mt-auto">
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-2 py-1`}>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-black text-blue-600 text-sm shrink-0">
                  {patientData.name.charAt(0)}
                </div>
                {!isSidebarCollapsed && (
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-black truncate">{patientData.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 truncate tracking-tight">{patientData.id}</p>
                  </div>
                )}
                {!isSidebarCollapsed && (
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                    title="Log Out"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Main Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${patientData ? 'min-h-screen' : ''}`}>
          <div className="max-w-7xl mx-auto px-6 py-8 w-full">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <Smartphone className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase">{activeTab === 'dashboard' ? 'Health Overview' : activeTab.replace('-', ' ')}</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">AI Health Report Analyzer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
          </div>
        </header>

            <main>
              <AnimatePresence mode="wait">
                
                {/* Onboarding Registration View */}
                {view === 'registration' && (
                  <motion.div
                    key="registration"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="text-center mb-12">
                       <Badge variant="primary" className="mb-4">AI Healthcare Onboarding</Badge>
                       <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Welcome to CareSync</h2>
                       <p className="text-gray-400 font-medium text-lg max-w-xl mx-auto mt-4">Let's build your unified health profile and secure medical timeline in few easy steps.</p>
                    </div>
                    <OnboardingForm onComplete={handleRegister} />
                  </motion.div>
                )}

                {/* 1. Switchable Patient Tabs */}
                {view === 'patient' && patientData && (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-12"
                  >
                    {/* 1. Dashboard Tab Overview */}
                    {activeTab === 'dashboard' && (
                      <div className="space-y-6">
                        {/* Top Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {[
                            { label: 'Conditions Detected', value: healthOverview.conditions.length.toString(), trend: 'Updated', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'Active Allergies', value: healthOverview.allergies.length.toString(), trend: 'Verified', icon: Shield, color: 'text-rose-600', bg: 'bg-rose-50' },
                            { label: 'Reports Analyzed', value: healthOverview.reportsCount.toString(), trend: '+2', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Risk Level', value: healthOverview.riskLevel, trend: 'Calculated', icon: AlertCircle, color: healthOverview.riskLevel === 'High' ? 'text-rose-600' : 'text-emerald-600', bg: healthOverview.riskLevel === 'High' ? 'bg-rose-50' : 'bg-emerald-50' },
                          ].map((stat, i) => (
                            <motion.div 
                              key={i}
                              whileHover={{ y: -5, scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <Card className="p-6 border-none shadow-sm bg-white overflow-hidden relative group">
                                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={20} />
                                  </div>
                                  <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{stat.trend}</span>
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
                                <h4 className="text-2xl font-black tracking-tight relative z-10">{stat.value}</h4>
                              </Card>
                            </motion.div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-8">
                            <Card className="p-8">
                              <div className="flex items-center justify-between mb-8">
                                <div>
                                   <h3 className="text-xl font-black tracking-tight">Health Summary</h3>
                                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Extracted Clinical Trends</p>
                                </div>
                                <Badge variant="primary">AI Analysis</Badge>
                              </div>
                              
                              <div className="space-y-6">
                                 <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                                    <div className="flex items-center gap-3 mb-4">
                                       <BrainCircuit className="text-blue-600" size={18} />
                                       <h5 className="text-xs font-black uppercase tracking-widest text-blue-900">Latest Insights</h5>
                                    </div>
                                    <p className="text-sm font-medium text-blue-900/70 leading-relaxed">
                                       {healthOverview.reportsCount > 0 
                                         ? (reports[0]?.summary || `Based on your ${healthOverview.reportsCount} medical reports, your clinical profile is now being tracked. Click on reports in the timeline for detailed insights.`)
                                         : "Upload your medical reports in the 'Report Analyzer' tab to generate AI-driven clinical insights and track your health progression."}
                                    </p>
                                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 mt-6">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Detected Conditions</p>
                                        <div className="flex flex-wrap gap-2">
                                           {healthOverview.conditions.length > 0 
                                             ? healthOverview.conditions.map((c, i) => <Badge key={i} variant="warning">{safeString(c)}</Badge>)
                                             : <span className="text-[10px] text-gray-400 font-bold uppercase">No clinical conditions found</span>}
                                        </div>
                                     </div>
                                     <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 mt-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Known Allergies</p>
                                        <div className="flex flex-wrap gap-2">
                                           {healthOverview.allergies.length > 0 
                                             ? healthOverview.allergies.map((a, i) => <Badge key={i} variant="danger">{safeString(a)}</Badge>)
                                             : <span className="text-[10px] text-gray-400 font-bold uppercase">No known allergies</span>}
                                        </div>
                                     </div>
                                 </div>
                              </div>
                            </Card>
                            
                            {/* NEW: Key Highlights Card */}
                            {healthOverview.reportsCount > 0 && (
                              <Card className="p-8 mt-6 bg-gradient-to-br from-gray-900 to-black text-white border-none shadow-2xl shadow-black/20 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-20">
                                  <Zap size={100} className="text-amber-400" />
                                </div>
                                <div className="relative z-10 space-y-6">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-400/20 rounded-lg">
                                      <Star className="text-amber-400" size={18} fill="currentColor" />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">Critical Insights</h3>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Major Clinical Finding</p>
                                      <p className="text-lg font-bold leading-tight">
                                        {healthOverview.conditions.length > 0 
                                          ? `Observation of ${healthOverview.conditions[0]} as a primary clinical marker.`
                                          : "No critical abnormalities detected in analyzed reports."}
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Next Recommended Step</p>
                                      <p className="text-lg font-bold leading-tight text-amber-400">
                                        {healthOverview.riskLevel === 'High' 
                                          ? "Urgent: Schedule a specialist consultation to review recent findings."
                                          : "Action: Routine follow-up in 3 months for continued monitoring."}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            )}
                          </div>

                          <div className="lg:col-span-4">
                            <Card className="p-8 h-full flex flex-col">
                              <div className="mb-8">
                                <h3 className="text-xl font-black tracking-tight">Timeline Snapshot</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Events</p>
                              </div>
                              <div className="space-y-6 flex-1">
                                {timelineEvents.length > 0 ? (
                                  timelineEvents.slice(0, 2).map((event, i) => (
                                    <div key={i} className="flex gap-4 group">
                                      <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full mt-1 ${event.type === 'Diagnosis' || event.type === 'report' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                        {i === 0 && timelineEvents.length > 1 && <div className="w-0.5 flex-1 bg-gray-100 my-1 group-last:hidden" />}
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{event.date}</p>
                                        <h5 className="text-sm font-black tracking-tight">{event.title}</h5>
                                        <p className="text-xs text-gray-400 line-clamp-1">{event.desc}</p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                    <Clock className="text-gray-200 mb-4" size={48} />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Recent Events</p>
                                    <p className="text-[10px] text-gray-400 mt-2">Upload a report to see your timeline snapshot.</p>
                                  </div>
                                )}
                              </div>
                              <Button variant="outline" className="w-full mt-6" onClick={() => setActiveTab('timeline')}>
                                 View Full Timeline <ChevronRight size={14} />
                              </Button>
                            </Card>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. Report Analyzer Tab */}
                    {activeTab === 'analyzer' && (
                      <div className="max-w-5xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                           <h3 className="text-3xl font-black tracking-tighter">Report Analyzer</h3>
                           <Badge variant="primary">Secured with AES-256</Badge>
                        </div>

                        <div className="lg:col-span-12 space-y-8">
                           <FileUpload onUploadComplete={handleFileUpload} />

                           {/* Recently Analyzed History */}
                           <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                 <h4 className="text-xl font-black tracking-tight text-blue-900">Recently Analyzed</h4>
                                 <Badge variant="neutral">History</Badge>
                              </div>

                              {isLoadingReports ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {[1, 2, 3].map(i => (
                                    <Card key={i} className="p-6 animate-pulse">
                                      <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
                                      <div className="h-3 bg-gray-50 rounded w-full mb-2" />
                                      <div className="h-3 bg-gray-50 rounded w-2/3" />
                                    </Card>
                                  ))}
                                </div>
                              ) : reports.length === 0 ? (
                                <Card className="p-12 border-dashed border-2 border-gray-100 flex flex-col items-center justify-center text-center bg-gray-50/30">
                                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                      <FileText className="text-gray-300" size={32} />
                                   </div>
                                   <h5 className="text-sm font-black text-gray-900 mb-1">No reports analyzed yet</h5>
                                   <p className="text-xs text-gray-400 font-medium max-w-[200px]">Upload your first medical report to see the AI analysis history here.</p>
                                </Card>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {reports.slice(0, 3).map((r, i) => (
                                    <Card 
                                      key={i} 
                                      className="p-6 cursor-pointer hover:border-blue-200 transition-all group"
                                      onClick={() => setAnalysisResult(r)}
                                    >
                                      <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                          <FileText size={20} />
                                        </div>
                                        <Badge variant={r.risk_level === 'High' ? 'danger' : r.risk_level === 'Medium' ? 'warning' : 'success'}>
                                          {r.risk_level}
                                        </Badge>
                                      </div>
                                      <h5 className="font-black text-sm mb-2 line-clamp-1">{r.title || "Medical Report"}</h5>
                                      <p className="text-[10px] text-gray-400 font-medium line-clamp-2 leading-relaxed">
                                        {r.summary}
                                      </p>
                                      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{formatDate(r.created_at)}</span>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              )}
                           </div>

                           {/* Analysis Results Display */}
                           <AnimatePresence>
                             {analysisResult && (
                               <motion.div
                                 initial={{ opacity: 0, y: 20 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className="space-y-6"
                                >
                                 <div className="flex items-center justify-between">
                                    <h4 className="text-xl font-black tracking-tight">AI Insights</h4>
                                    <Badge variant={analysisResult.risk_level === 'High' ? 'danger' : analysisResult.risk_level === 'Medium' ? 'warning' : 'success'}>
                                      Risk Level: {analysisResult.risk_level}
                                    </Badge>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                     {/* Summary Card */}
                                     <Card className="p-6 bg-blue-50 border-none lg:col-span-3">
                                       <div className="flex items-center gap-2 mb-3 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                                         <Zap size={14} fill="currentColor" /> Summary
                                       </div>
                                       <p className="text-blue-900 font-medium leading-relaxed">{analysisResult.summary}</p>
                                     </Card>

                                     {/* Conditions Card */}
                                     <Card className="p-6">
                                       <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Detected Conditions</h5>
                                       <div className="space-y-2">
                                         {normalizeData(analysisResult.conditions).map((c: any, i: number) => (
                                           <div key={i} className="flex flex-col gap-1">
                                             <div className="flex items-center gap-2 text-sm font-bold">
                                               <Activity size={14} className="text-amber-500" /> {c.name}
                                             </div>
                                             {c.evidence && (
                                               <p className="text-[10px] text-gray-400 italic ml-6">↳ {c.evidence}</p>
                                             )}
                                           </div>
                                         ))}
                                       </div>
                                     </Card>

                                     {/* Medications Card */}
                                     <Card className="p-6">
                                       <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Medications</h5>
                                       <div className="space-y-2">
                                         {normalizeData(analysisResult.medications).map((m: any, i: number) => (
                                           <div key={i} className="flex flex-col gap-1">
                                             <div className="flex items-center gap-2 text-sm font-bold">
                                               <Heart size={14} className="text-rose-500" /> {m.name}
                                             </div>
                                             {m.evidence && (
                                               <p className="text-[10px] text-gray-400 italic ml-6">↳ {m.evidence}</p>
                                             )}
                                           </div>
                                         ))}
                                       </div>
                                     </Card>

                                     {/* Tests Card */}
                                     <Card className="p-6">
                                       <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Tests & Procedures</h5>
                                       <div className="space-y-2">
                                         {analysisResult.tests?.map((t: any, i: number) => (
                                           <div key={i} className="flex items-center gap-2 text-sm font-bold">
                                             <Shield size={14} className="text-blue-500" /> {t}
                                           </div>
                                         ))}
                                       </div>
                                     </Card>
                                  </div>
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {/* 3. Timeline Tab */}
                    {activeTab === 'timeline' && (
                      <div className="max-w-4xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-3xl font-black tracking-tighter">Health Timeline</h3>
                          <Badge variant="primary">Life Events Tracked</Badge>
                        </div>
                        <Card className="p-8">
                          <Timeline 
                             items={timelineEvents} 
                          />
                        </Card>

                        {/* Selected Timeline Report Detail Overlay */}
                        <AnimatePresence>
                          {selectedTimelineReport && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                              onClick={() => setSelectedTimelineReport(null)}
                            >
                              <Card 
                                className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8 bg-white shadow-2xl relative"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button 
                                  onClick={() => setSelectedTimelineReport(null)}
                                  className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                  <X size={20} />
                                </button>

                                <div className="space-y-8">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                      <FileText size={28} />
                                    </div>
                                    <div>
                                      <h4 className="text-2xl font-black tracking-tight">Historical Insight</h4>
                                      <Badge variant={selectedTimelineReport.risk_level === 'High' ? 'danger' : 'success'}>
                                        Risk Level: {selectedTimelineReport.risk_level}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <p className="text-lg font-bold text-gray-900 leading-relaxed italic">
                                      "{selectedTimelineReport.summary}"
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                    <div className="space-y-4">
                                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Extracted Conditions</h5>
                                      <div className="grid grid-cols-1 gap-3 w-full">
                                        {normalizeData(selectedTimelineReport.conditions).map((c: any, i: number) => (
                                          <div key={i} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                                            <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
                                              <Activity size={14} className="text-amber-500" /> {c.name}
                                            </div>
                                            {c.evidence && <p className="text-[10px] text-amber-600 font-medium leading-relaxed italic mt-1 ml-6">↳ {c.evidence}</p>}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medications</h5>
                                      <div className="grid grid-cols-1 gap-3 w-full">
                                        {normalizeData(selectedTimelineReport.medications).map((m: any, i: number) => (
                                          <div key={i} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100/50">
                                            <div className="flex items-center gap-2 text-sm font-bold text-rose-900">
                                              <Heart size={14} className="text-rose-500" /> {m.name}
                                            </div>
                                            {m.evidence && <p className="text-[10px] text-rose-600 font-medium leading-relaxed italic mt-1 ml-6">↳ {m.evidence}</p>}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-6">
                                    <Button 
                                      className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                      onClick={() => {
                                        setAnalysisResult(selectedTimelineReport);
                                        setActiveTab('analyzer');
                                        setSelectedTimelineReport(null);
                                      }}
                                    >
                                      LOAD INTO ANALYZER
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {activeTab === 'insurance' && (
                      <div className="max-w-4xl mx-auto space-y-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                          <div className="space-y-2">
                             <div className="flex items-center gap-2 text-blue-600 mb-2">
                               <ShieldCheck size={20} />
                               <span className="text-[10px] font-black uppercase tracking-widest">CareSync Protection</span>
                             </div>
                             <h3 className="text-4xl font-black tracking-tighter">Insurance Marketplace</h3>
                             <p className="text-gray-400 text-sm font-medium">Personalized plans matched to your health profile.</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                             {['All', 'Low Risk', 'High Coverage', 'Budget'].map(f => (
                               <button 
                                 key={f}
                                 onClick={() => setInsuranceFilter(f)}
                                 className={cn(
                                   "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                   insuranceFilter === f 
                                     ? "bg-black text-white shadow-xl shadow-black/10 scale-105" 
                                     : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200"
                                 )}
                               >
                                 {f}
                               </button>
                             ))}
                          </div>
                        </div>

                        {/* Matching Engine Logic */}
                        {(() => {
                           const latestReport = reports[0];
                           const userRisk = latestReport?.risk_level || "Low";
                           const userConditions = normalizeData(latestReport?.conditions || []);
                           const reportSummary = latestReport?.summary || "";
                           const userAge = getAge(patientData?.dob);

                           // Smart Vitals Extraction (Regex-based clinical signals)
                           const vitals = {
                             diabetes: /hba1c|blood sugar|glucose|diabetic/i.test(reportSummary),
                             cholesterol: /cholesterol|ldl|hdl|triglyceride|lipid/i.test(reportSummary),
                             heart: /heart|cardiac|bp|blood pressure|hypertension/i.test(reportSummary)
                           };
                           
                           const eligiblePlans = insurancePlans.filter(plan => {
                             if (plan.min_age && userAge < plan.min_age) return false;
                             if (plan.max_age && userAge > plan.max_age) return false;
                             return true;
                           });

                           const scoredPlans = eligiblePlans.map(plan => {
                             let score = 0;

                             // 1. Risk Profile Match (Weight: 3)
                             if (plan.risk_supported.includes(userRisk)) score += 3;

                             // 2. Detected Conditions Match (Weight: 4)
                             const conditionMatch = userConditions.some(c => 
                               plan.conditions_supported.includes(c.name)
                             );
                             if (conditionMatch) score += 4;

                             // 3. Clinical Vitals Focus (Weight: 3 per match)
                             Object.keys(vitals).forEach(v => {
                               if (vitals[v as keyof typeof vitals] && plan.vitals_focus.includes(v)) {
                                 score += 3;
                               }
                             });

                             // 4. Claim Ratio Bonus (Weight: up to 5)
                             const ratio = parseInt(plan.claim_ratio.replace('%', ''));
                             score += (ratio / 20);
                             
                             return { ...plan, score };
                           })
                           .filter(plan => {
                             if (insuranceFilter === 'Low Risk') return plan.risk_supported.includes('Low');
                             if (insuranceFilter === 'High Coverage') return plan.coverage.includes('Critical Illness') || plan.coverage.includes('Maternity');
                             if (insuranceFilter === 'Budget') return parseInt(plan.price.replace(/[^\d]/g, '')) < 10000;
                             return true;
                           })
                           .sort((a, b) => b.score - a.score);

                           const adjustedPremium = (price: string, risk: string) => {
                             if (risk === "High") return "↑ " + price;
                             if (risk === "Medium") return "~ " + price;
                             return price;
                           };

                           const riskMessage = (risk: string) => {
                             if (risk === "High") return "Higher premium due to elevated health risk";
                             if (risk === "Medium") return "Moderate premium impact based on profile";
                             return "Standard premium pricing applied";
                           };

                           const coverageGap = (plan: any) => {
                             return userConditions.filter(uc => 
                               !plan.conditions_supported.includes(uc.name)
                             );
                           };

                           const getReason = (plan: any) => {
                             if (plan.vitals_focus.some((v: string) => vitals[v as keyof typeof vitals])) {
                               return "Precision match based on your recent medical vitals and lab results.";
                             }
                             if (plan.conditions_supported.some((c: string) => userConditions.some(uc => uc.name === c))) {
                               return "Designed to provide specialized coverage for your detected health conditions.";
                             }
                             if (plan.risk_supported.includes(userRisk)) {
                               return "Optimized for your current health risk profile and wellness data.";
                             }
                             return "Recommended as a stable, general-purpose health coverage solution.";
                           };

                           const getLabel = (score: number) => {
                             if (score >= 10) return { text: "AI Best Match", class: "bg-emerald-500 shadow-emerald-200" };
                             if (score >= 6) return { text: "Highly Recommended", class: "bg-blue-500 shadow-blue-200" };
                             return { text: "Standard", class: "bg-gray-400" };
                           };

                           return (
                             <div className="space-y-8">
                               {/* Featured Best Plan */}
                               {scoredPlans.length > 0 && insuranceFilter === 'All' && (
                                 <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   className="relative p-1 rounded-[3rem] bg-gradient-to-br from-emerald-400 via-emerald-500 to-blue-600 shadow-2xl shadow-emerald-500/20 mb-12"
                                 >
                                   <div className="bg-white rounded-[2.8rem] p-10">
                                     <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                       <div className="space-y-6 flex-1">
                                         <div className="flex items-center gap-3">
                                           <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                             <Zap size={12} fill="white" /> AI Top Recommendation
                                           </div>
                                           <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-emerald-100">
                                             {getLabel(scoredPlans[0].score).text}
                                           </Badge>
                                         </div>
                                         <div className="space-y-2">
                                           <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Personalized Proposal</p>
                                           <h4 className="text-3xl font-black tracking-tight text-gray-900">Recommended: {scoredPlans[0].name}</h4>
                                           <div className="flex items-center gap-2 mt-1 mb-4">
                                             <Badge variant={userRisk === 'High' ? 'danger' : userRisk === 'Medium' ? 'warning' : 'success'}>
                                               Risk Level: {userRisk}
                                             </Badge>
                                             <span className="text-xs font-bold text-gray-400 italic">
                                               ({userConditions.length > 0 ? `due to ${userConditions[0].name}` : "standard actuarial risk"})
                                             </span>
                                           </div>
                                           <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 mt-2">
                                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">AI Reasoning</p>
                                             <p className="text-sm font-medium text-gray-600 leading-relaxed">
                                               {getReason(scoredPlans[0])}
                                             </p>
                                           </div>
                                         </div>
                                         <div className="flex items-center gap-8">
                                           <div>
                                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Premium</p>
                                             <p className="text-2xl font-black text-emerald-600">{adjustedPremium(scoredPlans[0].price, userRisk)}</p>
                                             <p className="text-[10px] font-bold text-gray-400 mt-1">{riskMessage(userRisk)}</p>
                                           </div>
                                           <div>
                                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Claim Ratio</p>
                                             <p className="text-2xl font-black text-gray-900">{scoredPlans[0].claim_ratio}</p>
                                           </div>
                                           <div>
                                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Match Confidence</p>
                                             <div className="flex items-center gap-2">
                                               <p className="text-2xl font-black text-blue-600">{Math.min(100, Math.round(scoredPlans[0].score * 10))}%</p>
                                             </div>
                                           </div>
                                         </div>
                                       </div>
                                       <div className="w-full md:w-auto text-right">
                                          <Button className="w-full md:w-64 h-20 rounded-3xl bg-black text-white hover:bg-gray-900 text-sm font-black uppercase tracking-widest shadow-2xl shadow-black/20 group">
                                            SECURE NOW
                                            <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                          </Button>
                                       </div>
                                     </div>
                                     
                                     {/* Coverage Gaps (Trust Factor) */}
                                     {coverageGap(scoredPlans[0]).length > 0 && (
                                       <div className="mt-8 pt-8 border-t border-gray-100">
                                         <div className="flex items-center gap-2 text-rose-500 mb-3">
                                           <AlertCircle size={14} />
                                           <span className="text-[10px] font-black uppercase tracking-widest">Plan Limitations</span>
                                         </div>
                                         <p className="text-xs text-gray-500 font-medium">
                                           Note: This plan does not fully cover detected conditions: <span className="font-bold text-gray-700">{coverageGap(scoredPlans[0]).map(c => c.name).join(", ")}</span>. 
                                           Consider a high-coverage add-on for full protection.
                                         </p>
                                       </div>
                                     )}
                                   </div>
                                 </motion.div>
                               )}

                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                 {scoredPlans.map((plan, idx) => (
                                   <motion.div 
                                     key={plan.id}
                                     initial={{ opacity: 0, y: 20 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ delay: idx * 0.1 }}
                                     className="group"
                                   >
                                     <div className="bg-white rounded-[2.5rem] p-8 group hover:scale-[1.02] transition-all border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-black/5 relative overflow-hidden flex flex-col h-full">
                                       <div className="flex items-start justify-between mb-8">
                                         <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                           {plan.logo}
                                         </div>
                                         <div className={cn(
                                           "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-lg",
                                           getLabel(plan.score).class
                                         )}>
                                           {getLabel(plan.score).text}
                                         </div>
                                       </div>

                                       <div className="space-y-2 mb-6">
                                         <h4 className="text-lg font-black tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">{plan.name}</h4>
                                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{plan.provider}</p>
                                       </div>

                                       <div className="flex items-baseline gap-1 mb-6">
                                          <span className="text-3xl font-black tracking-tighter">{plan.price.split('/')[0]}</span>
                                          <span className="text-gray-400 text-xs font-bold tracking-tight">/{plan.price.split('/')[1]}</span>
                                       </div>

                                       <div className="space-y-4 mb-8 flex-1">
                                         <div className="flex flex-wrap gap-2">
                                           {plan.coverage.map((c, i) => (
                                             <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                               {c}
                                             </span>
                                           ))}
                                         </div>
                                         <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                           {getReason(plan)}
                                         </p>
                                      </div>

                                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50 mb-6">
                                         <div>
                                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Premium</p>
                                           <p className="text-lg font-black text-emerald-600">{adjustedPremium(plan.price, userRisk)}</p>
                                         </div>
                                         <div className="text-right">
                                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Confidence</p>
                                           <p className="text-lg font-black text-blue-600">{Math.min(100, Math.round(plan.score * 10))}%</p>
                                         </div>
                                      </div>

                                      {/* Coverage Gaps */}
                                      {coverageGap(plan).length > 0 && (
                                        <div className="mb-6 p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                                          <div className="flex items-center gap-2 text-rose-500 mb-2">
                                            <AlertCircle size={12} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Exclusions Identified</span>
                                          </div>
                                          <p className="text-[10px] text-rose-600/80 font-medium leading-tight">
                                            Does not cover: {coverageGap(plan).map(c => c.name).join(", ")}
                                          </p>
                                        </div>
                                      )}

                                       <Button className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-black/5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                          View Details <ChevronRight size={14} className="ml-2" />
                                       </Button>
                                     </div>
                                   </motion.div>
                                 ))}
                               </div>
                             </div>
                           );
                        })()}

                        {/* Why These Plans? Section */}
                        <Card className="p-8 bg-black text-white border-none relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-10">
                             <Wallet size={80} />
                          </div>
                          <div className="relative z-10 space-y-4">
                             <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                <BrainCircuit size={16} /> AI Recommendation Engine
                             </div>
                             <h4 className="text-xl font-black tracking-tight">How we match your plans</h4>
                             <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                               Our AI advisor analyzes your clinical data, age, and risk profile to identify plans with the highest <span className="text-blue-400 font-black">Confidence Score</span>. We uniquely show <span className="text-rose-400 font-black">Coverage Gaps</span> for conditions detected in your reports and adjust <span className="text-emerald-400 font-black">Estimated Premiums</span> based on your current health risk level.
                             </p>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* 5. Chat Tab */}
                    {activeTab === 'chat' && (
                      <div className="max-w-4xl mx-auto h-[600px] flex flex-col gap-6">
                        <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-xl">
                          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                                <BrainCircuit className="text-white" size={20} />
                              </div>
                              <div>
                                <h4 className="text-sm font-black tracking-tight">CareSync AI Assistant</h4>
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Always Online</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                            {chatHistory.map((msg, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-line ${
                                  msg.sender === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                } shadow-sm`}>
                                  {msg.text}
                                </div>
                              </motion.div>
                            ))}
                            {isTyping && (
                              <div className="flex justify-start">
                                <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                </div>
                              </div>
                            )}
                            <div ref={chatEndRef} />
                          </div>

                          <div className="p-6 bg-white border-t border-gray-100">
                            <div className="relative flex items-center">
                              <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                                placeholder="Ask about your health, reports, or habits..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 pr-24 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                              />
                              <div className="absolute right-2 flex gap-2">
                                <button 
                                  onClick={handleChatSend}
                                  className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-all active:scale-95"
                                >
                                  <Send size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* 6. Profile/QR Tab */}
                    {activeTab === 'profile' && (
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                          
                          {/* LEFT COLUMN: PATIENT SUMMARY & INFO */}
                          <div className="lg:col-span-4 space-y-8">
                            {/* Profile Card */}
                            <Card className="p-8 text-center relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />
                              <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-blue-100 rounded-[2rem] flex items-center justify-center text-blue-600 border-4 border-white shadow-2xl mb-6 group-hover:scale-105 transition-transform duration-500">
                                  <User size={48} />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight text-gray-900 mb-2">{patientData?.name}</h3>
                                <div className="flex items-center gap-2 mb-6">
                                  <Badge variant="success" className="px-3 py-1">Verified Profile</Badge>
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none italic opacity-50"># {patientData?.id.slice(0, 8)}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-gray-50">
                                  <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Age</p>
                                    <p className="text-lg font-black text-gray-900">{patientData?.dob ? `${getAge(patientData.dob)}` : patientData?.age || '--'}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Gender</p>
                                    <p className="text-lg font-black text-gray-900">{patientData?.gender || '--'}</p>
                                  </div>
                                </div>
                                <Button variant="secondary" className="w-full mt-8 rounded-2xl h-12 text-[10px] font-black tracking-widest uppercase">
                                  EDIT PROFILE
                                </Button>
                              </div>
                            </Card>

                            {/* Clinical Info Card */}
                            <Card className="p-8 space-y-8">
                              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                <Stethoscope size={20} className="text-blue-600" />
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Clinical Identity</h4>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-gray-400">
                                    <Heart size={16} className="text-rose-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Blood Group</span>
                                  </div>
                                  <span className="text-sm font-black text-rose-600">{patientData?.blood_group || '--'}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-gray-400">
                                    <Activity size={16} className="text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Height / Weight</span>
                                  </div>
                                  <span className="text-sm font-black text-gray-900">{patientData?.height || '--'} / {patientData?.weight || '--'}</span>
                                </div>

                                <div className="space-y-3 pt-2">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Active Conditions</p>
                                  <div className="flex flex-wrap gap-2">
                                    {healthOverview.conditions.length > 0 ? (
                                      healthOverview.conditions.slice(0, 3).map((c, i) => <Badge key={i} variant="warning" className="text-[9px]">{safeString(c)}</Badge>)
                                    ) : <p className="text-[10px] text-gray-300 italic font-bold">None detected</p>}
                                  </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Allergies</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(patientData?.allergies) ? patientData.allergies : (patientData?.allergies ? patientData.allergies.split(',') : [])).length > 0 ? (
                                      (Array.isArray(patientData?.allergies) ? patientData.allergies : patientData?.allergies?.split(',') || []).slice(0, 2).map((a: string, i: number) => <Badge key={i} variant="danger" className="text-[9px]">{safeString(a)}</Badge>)
                                    ) : <p className="text-[10px] text-gray-300 italic font-bold">No known allergies</p>}
                                  </div>
                                </div>
                              </div>
                            </Card>

                            <Card className="p-8 bg-gray-900 text-white space-y-6">
                              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <AlertCircle size={20} className="text-rose-500" />
                                <h4 className="text-xs font-black uppercase tracking-[0.2em]">Emergency Data</h4>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Contact Person</p>
                                  <p className="text-sm font-bold">{patientData?.emergency_contact_name || '--'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Contact Phone</p>
                                  <p className="text-sm font-bold text-rose-400">{patientData?.emergency_contact_phone || '--'}</p>
                                </div>
                              </div>
                            </Card>
                          </div>

                          {/* RIGHT COLUMN: MAIN CONTENT */}
                          <div className="lg:col-span-8 space-y-8">
                            
                            {/* TOP: HEALTH METRICS GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <Card className="p-6 border-l-4 border-l-blue-500 bg-blue-50/30">
                                <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Reports Analyzed</p>
                                <div className="flex items-end gap-2">
                                  <span className="text-3xl font-black text-blue-600">{reports.length}</span>
                                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-1.5 opacity-50">Files</span>
                                </div>
                              </Card>
                              <Card className="p-6 border-l-4 border-l-emerald-500 bg-emerald-50/30">
                                <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1">Current Risk</p>
                                <div className="flex items-end gap-2">
                                  <span className="text-3xl font-black text-emerald-600">{reports[0]?.risk_level || '--'}</span>
                                  <Badge variant="success" className="mb-1.5">Stable</Badge>
                                </div>
                              </Card>
                              <Card className="p-6 border-l-4 border-l-amber-500 bg-amber-50/30">
                                <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Latest Update</p>
                                <div className="flex items-end gap-2">
                                  <span className="text-sm font-black text-amber-600 uppercase tracking-widest leading-loose">
                                    {reports[0] ? formatDate(reports[0].created_at) : '--'}
                                  </span>
                                </div>
                              </Card>
                            </div>

                            {/* MIDDLE: RECENT TEST REPORTS */}
                            <Card className="p-8 space-y-6">
                              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-3">
                                  <FileText size={20} className="text-blue-600" />
                                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Verified Test Reports</h4>
                                </div>
                                <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">View All</button>
                              </div>
                              
                              <div className="space-y-3">
                                {reports.length > 0 ? reports.slice(0, 3).map((r, i) => (
                                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 rounded-2xl transition-all group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <FileText size={18} />
                                      </div>
                                      <div>
                                        <h5 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{r.title}</h5>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formatDate(r.created_at)}</p>
                                      </div>
                                    </div>
                                    <Badge variant={r.risk_level === 'High' ? 'danger' : r.risk_level === 'Medium' ? 'warning' : 'success'} className="text-[8px]">{r.risk_level}</Badge>
                                  </div>
                                )) : (
                                  <p className="text-sm text-gray-300 italic py-4">No analysis data available yet.</p>
                                )}
                              </div>
                            </Card>

                            {/* BOTTOM: MEDICAL HISTORY & PRESCRIPTIONS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <Card className="p-8 space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                  <Clock size={20} className="text-emerald-500" />
                                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Medical History</h4>
                                </div>
                                <div className="space-y-4">
                                  {healthOverview.conditions.length > 0 ? healthOverview.conditions.slice(0, 4).map((c, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                      <span className="font-bold text-gray-900">{c}</span>
                                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">Active</span>
                                    </div>
                                  )) : (
                                    <p className="text-sm text-gray-300 italic">No history records found.</p>
                                  )}
                                </div>
                              </Card>

                              <Card className="p-8 space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                  <Shield size={20} className="text-blue-600" />
                                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Digital Health ID</h4>
                                </div>
                                
                                {(() => {
                                  const latestReport = reports[0];
                                  const qrData = {
                                    type: "CareSyncProfile",
                                    version: "1.0",
                                    id: patientData?.id,
                                    basic_info: {
                                      name: patientData?.name,
                                      age: patientData?.dob ? getAge(patientData.dob) : patientData?.age,
                                      gender: patientData?.gender,
                                      blood_group: patientData?.blood_group
                                    },
                                    medical_summary: {
                                      risk_level: latestReport?.risk_level || "Unknown",
                                      conditions: (latestReport?.conditions || []).slice(0, 3).map((c: any) => 
                                        typeof c === "string" ? c : c.name
                                      ),
                                      medications: (latestReport?.medications || []).slice(0, 3).map((m: any) => 
                                        typeof m === "string" ? m : m.name
                                      ),
                                      allergies: Array.isArray(patientData?.allergies) ? patientData.allergies.slice(0, 3) : (patientData?.allergies || "None")
                                    },
                                    emergency: {
                                      contact_name: patientData?.emergency_contact_name || "N/A",
                                      phone: patientData?.emergency_contact_phone || "N/A"
                                    },
                                    meta: {
                                      last_updated: new Date().toISOString().split("T")[0],
                                      source: "CareSync AI"
                                    },
                                    access: {
                                      profile_url: profileUrl
                                    }
                                  };

                                  return (
                                    <div className="flex flex-col items-center">
                                      <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-inner mb-4 relative group inline-block mx-auto">
                                        <QRCodeSVG 
                                          value={qrFormat === 'json' ? JSON.stringify(qrData) : profileUrl} 
                                          size={160}
                                          includeMargin={false}
                                          level="M"
                                        />
                                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                                          <QrCode className="text-blue-600" size={24} />
                                        </div>
                                      </div>

                                      <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
                                        <button 
                                          onClick={() => setQrFormat('url')}
                                          className={cn(
                                            "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                                            qrFormat === 'url' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                          )}
                                        >
                                          Demo URL
                                        </button>
                                        <button 
                                          onClick={() => setQrFormat('json')}
                                          className={cn(
                                            "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                                            qrFormat === 'json' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                          )}
                                        >
                                          System JSON
                                        </button>
                                      </div>

                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center leading-relaxed">
                                        SCAN FOR EMERGENCY ACCESS<br />
                                        <span className="text-blue-600">CARESYNC IDENTITY PROTOCOL</span>
                                      </p>
                                    </div>
                                  );
                                })()}
                              </Card>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 7. Settings Tab */}
                    {activeTab === 'settings' && (
                      <div className="max-w-4xl mx-auto space-y-8">
                         <h3 className="text-3xl font-black tracking-tighter text-blue-900">Account Settings</h3>
                         
                         <div className="space-y-6">
                            <Card className="p-8">
                               <h4 className="text-xl font-black mb-6">Security & Privacy</h4>
                               <div className="space-y-6">
                                  {[
                                     { label: 'Two-Factor Authentication', desc: 'Secure your medical data with 2FA.', enabled: true },
                                     { label: 'Report Encryption', desc: 'Automatically encrypt all uploaded PDFs.', enabled: true },
                                  ].map((item, i) => (
                                     <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div>
                                           <h5 className="font-bold text-sm">{item.label}</h5>
                                           <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                                        </div>
                                        <div className="flex gap-2">
                                           <Badge variant={item.enabled ? 'success' : 'neutral'}>{item.enabled ? 'Enabled' : 'Disabled'}</Badge>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </Card>
                         </div>
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedTimelineReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">Medical Insight</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Extracted via CareSync AI</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={selectedTimelineReport.risk_level === 'High' ? 'danger' : selectedTimelineReport.risk_level === 'Medium' ? 'warning' : 'success'}>
                    Risk: {selectedTimelineReport.risk_level}
                  </Badge>
                  <button 
                    onClick={() => setSelectedTimelineReport(null)}
                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 overflow-y-auto space-y-8 no-scrollbar">
                {/* Summary Section */}
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                  <div className="flex items-center gap-2 mb-3 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                    <Zap size={14} fill="currentColor" /> Clinical Summary
                  </div>
                  <p className="text-blue-900 font-medium leading-relaxed italic">
                    "{selectedTimelineReport.summary}"
                  </p>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Conditions */}
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-amber-600 font-black text-[10px] uppercase tracking-widest">
                      <Activity size={14} /> Conditions
                    </div>
                    <div className="space-y-3">
                      {normalizeData(selectedTimelineReport.conditions).map((c: any, i: number) => (
                        <div key={i} className="group">
                          <div className="flex gap-2 items-start text-sm font-bold text-gray-700 group-hover:text-amber-700 transition-colors">
                            <span className="text-amber-500">•</span>
                            {c.name}
                          </div>
                          {c.evidence && (
                            <p className="ml-5 mt-1 text-[10px] text-gray-400 italic leading-tight group-hover:text-amber-600/60 transition-colors">
                              ↳ "{c.evidence}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Medications */}
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-rose-600 font-black text-[10px] uppercase tracking-widest">
                      <Heart size={14} /> Medications
                    </div>
                    <div className="space-y-3">
                      {normalizeData(selectedTimelineReport.medications).map((m: any, i: number) => (
                        <div key={i} className="group">
                          <div className="flex gap-2 items-start text-sm font-bold text-gray-700 group-hover:text-rose-700 transition-colors">
                            <span className="text-rose-500">•</span>
                            {m.name}
                          </div>
                          {m.evidence && (
                            <p className="ml-5 mt-1 text-[10px] text-gray-400 italic leading-tight group-hover:text-rose-600/60 transition-colors">
                              ↳ "{m.evidence}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Tests */}
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                      <Shield size={14} /> Tests
                    </div>
                    <div className="space-y-3">
                      {selectedTimelineReport.tests?.map((t: any, i: number) => (
                        <div key={i} className="flex gap-2 items-start text-sm font-bold text-gray-700">
                          <span className="text-blue-500">•</span>
                          {t}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={24} className="text-emerald-500" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified by CareSync Protocol</p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedTimelineReport(null)}>
                    CLOSE INSIGHTS
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- Icons Helper ---
export function UsersIcon({ size }: { size: number }) {
  return <User size={size} />;
}

// --- Safety Helpers ---
const normalizeData = (arr: any[]) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => {
    let parsed = item;
    if (typeof item === 'string') {
      try {
        parsed = JSON.parse(item);
      } catch (e) {
        return { name: item, evidence: "" };
      }
    }
    
    if (parsed && typeof parsed === 'object') {
       return { 
         name: parsed.name || parsed.title || parsed.condition || "Unknown", 
         evidence: parsed.evidence || parsed.desc || parsed.reason || "" 
       };
    }
    return { name: String(item), evidence: "" };
  });
};

const safeString = (item: any): string => {
  if (!item) return "Unknown";
  let parsed = item;
  if (typeof item === 'string') {
    try {
      parsed = JSON.parse(item);
    } catch (e) {
      return item;
    }
  }
  if (parsed && typeof parsed === 'object') return parsed.name || parsed.title || parsed.condition || "Unknown";
  return String(item);
};

const formatDate = (date: any) => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? "Unknown" : d.toLocaleDateString();
};

