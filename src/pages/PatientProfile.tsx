import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Heart, 
  Activity, 
  Shield, 
  User, 
  FileText, 
  Zap, 
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ClipboardList
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
      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (userError) throw userError;

      // Fetch reports
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
    return arr.map(item =>
      typeof item === 'string'
        ? { name: item, evidence: '' }
        : item
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Clinical Profile</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div>
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Profile Not Found</h2>
          <p className="text-gray-500 max-w-xs mx-auto">The patient profile you are looking for does not exist or is no longer public.</p>
        </div>
      </div>
    );
  }

  const latest = reports[0] || {};
  const riskColor = {
    High: 'text-rose-600 bg-rose-50 border-rose-100',
    Medium: 'text-amber-600 bg-amber-50 border-amber-100',
    Low: 'text-emerald-600 bg-emerald-50 border-emerald-100'
  }[latest.risk_level as 'High' | 'Medium' | 'Low'] || 'text-gray-600 bg-gray-50 border-gray-100';

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      {/* Premium Header */}
      <div className="bg-black text-white py-12 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-blue-600 border-4 border-white/10 flex items-center justify-center text-3xl font-black shadow-2xl shadow-blue-500/20">
              {patient.full_name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">{patient.full_name}</h1>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">ID: {patient.id.slice(0, 8)}</span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-600 px-3 py-1 rounded-full border border-blue-400/20 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Verified Profile
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8 space-y-6">
        {/* Core Info Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Age</p>
            <p className="text-lg font-black">{patient.age || 'N/A'}</p>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Blood</p>
            <p className="text-lg font-black text-rose-600">{patient.blood_group || 'N/A'}</p>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Risk</p>
            <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${riskColor.split(' ')[1]} ${riskColor.split(' ')[0]}`}>
              {latest.risk_level || 'Low'}
            </div>
          </div>
        </div>

        {/* Physical Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Height</span>
            <span className="text-sm font-black text-blue-600">{patient.height || 'N/A'}</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weight</span>
            <span className="text-sm font-black text-emerald-600">{patient.weight || 'N/A'}</span>
          </div>
        </div>

        {/* AI Summary Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100/50 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Zap size={60} className="text-blue-600" fill="currentColor" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Zap size={18} className="text-blue-600" fill="currentColor" />
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-900">Latest Clinical Summary</h3>
          </div>
          <p className="text-blue-900/80 font-medium leading-relaxed italic">
            "{latest.summary || "No clinical summary available for this patient."}"
          </p>
        </motion.div>

        {/* Chronic Conditions Section */}
        {patient.chronic_diseases && (
          <div className="bg-amber-50/30 p-8 rounded-[2.5rem] border border-amber-100/50 space-y-4">
            <div className="flex items-center gap-3">
              <ClipboardList size={18} className="text-amber-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-900">Chronic Diseases</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {patient.chronic_diseases.split(',').map((d: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-white rounded-full text-xs font-bold text-amber-700 border border-amber-100 shadow-sm">
                  {d.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Conditions Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <Activity size={20} className="text-amber-500" />
            <h3 className="text-sm font-black uppercase tracking-widest">Detected in Reports</h3>
          </div>
          <div className="space-y-4">
            {normalize(latest.conditions).length > 0 ? (
              normalize(latest.conditions).map((c: any, i: number) => (
                <div key={i} className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    {c.name}
                  </div>
                  {c.evidence && (
                    <p className="text-[10px] text-gray-400 italic ml-4 leading-tight">↳ {c.evidence}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No chronic conditions detected in recent reports.</p>
            )}
          </div>
        </div>

        {/* Medications Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <Heart size={20} className="text-rose-500" />
            <h3 className="text-sm font-black uppercase tracking-widest">Current Medications</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {normalize(latest.medications).length > 0 ? (
              normalize(latest.medications).map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-rose-50/30 rounded-2xl border border-rose-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                      <ClipboardList size={14} />
                    </div>
                    <span className="text-sm font-bold text-rose-900">{m.name}</span>
                  </div>
                  {m.evidence && <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{m.evidence}</span>}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No active medications found.</p>
            )}
          </div>
        </div>

        {/* Contact info for emergency */}
        <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <AlertTriangle size={20} className="text-amber-400" />
            <h3 className="text-sm font-black uppercase tracking-widest">Emergency Contact</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Name</p>
                <p className="font-bold">{patient.emergency_contact_name || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Phone</p>
                <p className="font-bold">{patient.emergency_contact_phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Footer */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <MapPin size={20} className="text-blue-500" />
            <h3 className="text-sm font-black uppercase tracking-widest">Residential Address</h3>
          </div>
          <p className="text-sm font-medium text-gray-600 leading-relaxed">
            {patient.address || 'Address not shared on public profile.'}
          </p>
        </div>

        {/* Branding Footer */}
        <div className="pt-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 font-bold mb-2">
            <Shield size={14} /> Secure Clinical Profile
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Powered by CareSync AI • HIPAA Compliant Storage</p>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
