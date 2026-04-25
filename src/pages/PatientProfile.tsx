import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Heart, 
  Activity, 
  Shield, 
  User, 
  Zap, 
  AlertCircle,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Pill,
  Droplets,
  Smartphone,
  Calendar,
  Dna,
  Ruler,
  Weight,
  Cigarette,
  Wine,
  Dumbbell
} from 'lucide-react';
import { motion } from 'framer-motion';

const PatientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (userError) throw userError;

      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      setPatient(userData);
      setReports(reportsData || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalize = (arr: any) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
      if (typeof item === 'string') {
        try {
          const parsed = JSON.parse(item);
          if (typeof parsed === 'object' && parsed !== null) {
            return { name: parsed.name || parsed.condition || item, evidence: parsed.evidence || '' };
          }
          return { name: item, evidence: '' };
        } catch {
          return { name: item, evidence: '' };
        }
      }
      if (typeof item === 'object' && item !== null) {
        return { name: item.name || item.condition || 'Unknown', evidence: item.evidence || '' };
      }
      return { name: String(item), evidence: '' };
    });
  };

  const parseList = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(v => typeof v === 'string' ? v.trim() : String(v));
    if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Loading Clinical Profile</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Profile Not Found</h2>
          <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">The patient profile you are looking for does not exist or is no longer accessible.</p>
        </motion.div>
      </div>
    );
  }

  const latest = reports[0] || {};
  const conditions = normalize(latest.conditions);
  const medications = normalize(latest.medications);
  const allergies = parseList(patient.allergies);
  const chronicDiseases = parseList(patient.chronic_diseases);

  const riskLevel = (latest.risk_level || 'Low') as string;
  const riskStyles: Record<string, string> = {
    High: 'text-rose-700 bg-rose-50 border-rose-200',
    Medium: 'text-amber-700 bg-amber-50 border-amber-200',
    Low: 'text-emerald-700 bg-emerald-50 border-emerald-200'
  };
  const riskStyle = riskStyles[riskLevel] || riskStyles.Low;

  const cardClass = "bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm";

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">

      {/* ─── Header ─── */}
      <header className="bg-gray-900 text-white pt-10 pb-16 px-6 rounded-b-[2.5rem] shadow-2xl shadow-black/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full -mr-40 -mt-40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/5 rounded-full -ml-30 -mb-30 blur-3xl" />
        
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-600 border-4 border-white/10 flex items-center justify-center text-2xl md:text-3xl font-black shadow-2xl shadow-blue-500/30 shrink-0">
              {patient.full_name?.charAt(0) || '?'}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter truncate">{patient.full_name || 'Unknown Patient'}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  ID: {patient.id?.slice(0, 8)}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest bg-blue-600 px-3 py-1 rounded-full border border-blue-400/20 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Verified
                </span>
                {patient.gender && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {patient.gender}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 -mt-8 space-y-5 pb-16">

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Age', value: patient.age || 'N/A', icon: Calendar, color: 'text-blue-600' },
            { label: 'Blood', value: patient.blood_group || 'N/A', icon: Droplets, color: 'text-rose-600' },
            { label: 'Risk', value: riskLevel, icon: Shield, color: riskLevel === 'High' ? 'text-rose-600' : riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600' },
            { label: 'Reports', value: reports.length.toString(), icon: ClipboardList, color: 'text-violet-600' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center"
            >
              <stat.icon size={16} className={`${stat.color} mx-auto mb-2 opacity-60`} />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-base font-black ${stat.label === 'Risk' ? '' : ''}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Physical Metrics */}
        {(patient.height_cm || patient.weight_kg) && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ruler size={16} className="text-blue-500 opacity-60" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Height</span>
              </div>
              <span className="text-sm font-black text-blue-600">{patient.height_cm ? `${patient.height_cm} cm` : 'N/A'}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Weight size={16} className="text-emerald-500 opacity-60" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weight</span>
              </div>
              <span className="text-sm font-black text-emerald-600">{patient.weight_kg ? `${patient.weight_kg} kg` : 'N/A'}</span>
            </div>
          </div>
        )}

        {/* AI Summary */}
        {latest.summary && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50/60 p-6 md:p-8 rounded-[2rem] border border-blue-100/50 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 opacity-[0.06]">
              <Zap size={50} className="text-blue-600" fill="currentColor" />
            </div>
            <div className="flex items-center gap-2.5 mb-4">
              <Zap size={16} className="text-blue-600" fill="currentColor" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900">Latest Clinical Summary</h3>
            </div>
            <p className="text-blue-900/75 font-medium leading-relaxed italic text-sm">
              "{latest.summary}"
            </p>
          </motion.div>
        )}

        {/* Chronic Diseases */}
        {chronicDiseases.length > 0 && (
          <div className="bg-amber-50/40 p-6 md:p-8 rounded-[2rem] border border-amber-100/50 space-y-4">
            <div className="flex items-center gap-2.5">
              <ClipboardList size={16} className="text-amber-600" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-900">Chronic Conditions</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {chronicDiseases.map((d, i) => (
                <span key={i} className="px-3 py-1.5 bg-white rounded-full text-xs font-bold text-amber-700 border border-amber-100 shadow-sm">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detected Conditions */}
        <div className={cardClass + " space-y-5"}>
          <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
            <Activity size={18} className="text-amber-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Detected in Reports</h3>
            {conditions.length > 0 && (
              <span className="ml-auto text-[9px] font-black text-gray-300 uppercase tracking-widest">{conditions.length} found</span>
            )}
          </div>
          <div className="space-y-3">
            {conditions.length > 0 ? (
              conditions.map((c: any, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col gap-1 p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                    <span className="text-sm font-bold">{c.name}</span>
                  </div>
                  {c.evidence && (
                    <p className="text-[11px] text-gray-400 italic ml-4 leading-snug">↳ {c.evidence}</p>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic py-2">No conditions detected in recent reports.</p>
            )}
          </div>
        </div>

        {/* Medications */}
        <div className={cardClass + " space-y-5"}>
          <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
            <Pill size={18} className="text-rose-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Current Medications</h3>
            {medications.length > 0 && (
              <span className="ml-auto text-[9px] font-black text-gray-300 uppercase tracking-widest">{medications.length} active</span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3">
            {medications.length > 0 ? (
              medications.map((m: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 bg-rose-50/40 rounded-xl border border-rose-100/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                      <Pill size={14} />
                    </div>
                    <span className="text-sm font-bold text-rose-900">{m.name}</span>
                  </div>
                  {m.evidence && (
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest hidden sm:block">{m.evidence}</span>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic py-2">No active medications found.</p>
            )}
          </div>
        </div>

        {/* Allergies */}
        {allergies.length > 0 && (
          <div className={cardClass + " space-y-5"}>
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
              <AlertCircle size={18} className="text-orange-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Known Allergies</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((a, i) => (
                <span key={i} className="px-3 py-1.5 bg-orange-50 rounded-full text-xs font-bold text-orange-700 border border-orange-100">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lifestyle Indicators */}
        {(patient.smoking !== null || patient.alcohol_consumption !== null || patient.exercise_frequency) && (
          <div className={cardClass + " space-y-5"}>
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
              <Dna size={18} className="text-violet-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Lifestyle</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {patient.smoking !== null && patient.smoking !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Cigarette size={14} className={patient.smoking ? 'text-rose-500' : 'text-emerald-500'} />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Smoking</p>
                    <p className={`text-xs font-bold ${patient.smoking ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {patient.smoking ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              )}
              {patient.alcohol_consumption !== null && patient.alcohol_consumption !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Wine size={14} className={patient.alcohol_consumption ? 'text-amber-500' : 'text-emerald-500'} />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Alcohol</p>
                    <p className={`text-xs font-bold ${patient.alcohol_consumption ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {patient.alcohol_consumption ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              )}
              {patient.exercise_frequency && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Dumbbell size={14} className="text-blue-500" />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Exercise</p>
                    <p className="text-xs font-bold text-blue-600">{patient.exercise_frequency}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        <div className="bg-gray-900 p-6 md:p-8 rounded-[2rem] text-white space-y-5 shadow-2xl shadow-black/15">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
            <AlertTriangle size={18} className="text-amber-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Emergency Contact</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Name</p>
                <p className="font-bold text-sm truncate">{patient.emergency_contact_name || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                <Phone size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Phone</p>
                <p className="font-bold text-sm truncate">{patient.emergency_contact_phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        {patient.address && (
          <div className={cardClass + " space-y-4"}>
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
              <MapPin size={18} className="text-blue-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Residential Address</h3>
            </div>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">{patient.address}</p>
          </div>
        )}

        {/* Footer Branding */}
        <div className="pt-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-gray-300">
            <Smartphone size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">CareSync</span>
          </div>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.15em]">
            Secure Clinical Profile • HIPAA Compliant
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
