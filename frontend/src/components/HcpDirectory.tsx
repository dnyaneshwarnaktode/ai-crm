import { useEffect, useState } from 'react';
import { getHcps, createHcp } from '../services/api';
import { UserPlus, Search, Stethoscope, Building2, MapPin, Mail, Phone } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setInteractionData, clearInteraction } from '../store/interactionSlice';
import { clearChat } from '../store/chatSlice';

interface HCP {
  id: number;
  name: string;
  specialization: string | null;
  hospital: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
}

export function HcpDirectory() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [hcps, setHcps] = useState<HCP[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Add HCP Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newHcp, setNewHcp] = useState({
    name: '',
    specialization: '',
    hospital: '',
    city: '',
    email: '',
    phone: '',
  });

  const loadHcps = async () => {
    try {
      const data = await getHcps();
      setHcps(data);
    } catch (err) {
      console.error('Failed to load HCPs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHcps();
  }, []);

  const handleStartLog = (hcp: HCP) => {
    dispatch(clearChat());
    dispatch(clearInteraction());
    // Pre-populate HCP details in the store
    dispatch(
      setInteractionData({
        hcp_name: hcp.name,
        interaction_type: null,
        interaction_date: new Date().toISOString().split('T')[0],
        interaction_time: null,
        attendees: null,
        topics_discussed: null,
        summary: null,
        products: [],
        materials_shared: [],
        samples_distributed: [],
        sentiment: null,
        outcomes: null,
        follow_up: null,
      })
    );
    navigate('/logger');
  };

  const handleCreateHcp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHcp.name) return;
    try {
      await createHcp(newHcp);
      setNewHcp({
        name: '',
        specialization: '',
        hospital: '',
        city: '',
        email: '',
        phone: '',
      });
      setModalOpen(false);
      loadHcps();
    } catch (err) {
      console.error('Failed to register HCP', err);
    }
  };

  const filteredHcps = hcps.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    (h.specialization?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (h.hospital?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#0f1117] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Healthcare Professionals</h1>
          <p className="text-xs text-slate-400 mt-1">Manage and access pharmaceutical relationship details with key doctors.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-indigo-950/40 transition-all duration-200"
        >
          <UserPlus size={14} />
          Register Doctor
        </button>
      </div>

      {/* Search & Stats bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by doctor name, specialty, or clinic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
          {filteredHcps.length} doctors listed
        </p>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredHcps.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-900/10">
          <Stethoscope size={36} className="text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-400">No doctors found</p>
          <p className="text-xs text-slate-600 mt-1">Try refining your search or add a new doctor registration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredHcps.map((hcp) => (
            <div
              key={hcp.id}
              className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between transition-colors shadow-inner"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{hcp.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-medium">
                      <Stethoscope size={11} className="text-indigo-400" />
                      <span>{hcp.specialization || 'General Practitioner'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 tracking-wider">#{hcp.id}</span>
                </div>

                {/* Contact info list */}
                <div className="space-y-2 mt-4 text-[11px] text-slate-400 border-t border-slate-800/60 pt-3">
                  {hcp.hospital && (
                    <div className="flex items-center gap-2">
                      <Building2 size={11} className="text-slate-600" />
                      <span>{hcp.hospital}</span>
                    </div>
                  )}
                  {hcp.city && (
                    <div className="flex items-center gap-2">
                      <MapPin size={11} className="text-slate-600" />
                      <span>{hcp.city}</span>
                    </div>
                  )}
                  {hcp.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={11} className="text-slate-600" />
                      <span className="truncate">{hcp.email}</span>
                    </div>
                  )}
                  {hcp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={11} className="text-slate-600" />
                      <span>{hcp.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => handleStartLog(hcp)}
                className="w-full mt-5 py-2.5 bg-slate-800 hover:bg-slate-700/60 text-indigo-400 border border-indigo-500/10 rounded-xl text-xs font-semibold tracking-wide transition-colors"
              >
                Log New Interaction
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add HCP Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181a20] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200">Register Healthcare Professional</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleCreateHcp} className="p-6 space-y-4">
              {/* Doctor Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">HCP Name (Required)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Patel"
                  value={newHcp.name}
                  onChange={(e) => setNewHcp({ ...newHcp, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Specialization */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiologist"
                    value={newHcp.specialization}
                    onChange={(e) => setNewHcp({ ...newHcp, specialization: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                {/* Hospital */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Clinic / Hospital</label>
                  <input
                    type="text"
                    placeholder="e.g. City Hospital"
                    value={newHcp.hospital}
                    onChange={(e) => setNewHcp({ ...newHcp, hospital: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Boston"
                    value={newHcp.city}
                    onChange={(e) => setNewHcp({ ...newHcp, city: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555 1234"
                    value={newHcp.phone}
                    onChange={(e) => setNewHcp({ ...newHcp, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. jane.patel@hospital.org"
                  value={newHcp.email}
                  onChange={(e) => setNewHcp({ ...newHcp, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-indigo-950/20 transition-all duration-200 mt-2"
              >
                Register HCP Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
