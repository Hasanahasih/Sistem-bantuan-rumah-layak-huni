import { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { RTLHApplication } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ClipboardCheck, ArrowRight, Brain, Send, X, FileText } from 'lucide-react';
import { formatCurrency } from '@/src/lib/utils';

export default function DashboardSurveyor() {
  const [applications, setApplications] = useState<RTLHApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<RTLHApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'applications'), where('status', 'in', ['pending', 'verified']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RTLHApplication)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAnalyze = async (app: RTLHApplication) => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-rtlh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationData: app })
      });
      const data = await response.json();
      
      if (data.score !== undefined) {
        // Update Firestore
        await updateDoc(doc(db, 'applications', app.id), {
          score: data.score,
          aiAnalysis: data.analysis,
          status: 'verified',
          updatedAt: new Date().toISOString()
        });
        
        // Also update local selected app
        setSelectedApp({...app, score: data.score, aiAnalysis: data.analysis, status: 'verified'});
        
        // Send notification email
        await fetch('/api/email/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: (await getDoc(doc(db, 'users', app.applicantId))).data()?.email,
            subject: 'Status Verifikasi RTLH: Data Terverifikasi',
            body: `Halo <b>${app.applicantName}</b>, Data pengajuan bantuan RTLH Anda telah diverifikasi oleh surveyor. Skor kelayakan awal Anda adalah <b>${data.score}</b>.`
          })
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredApps = applications.filter(app => 
    app.applicantName.toLowerCase().includes(search.toLowerCase()) ||
    app.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel Surveyor</h1>
        <p className="text-gray-500">Lakukan verifikasi lapangan dan sinkronisasi data dengan bantuan AI.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau ID pengajuan..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-lg border border-yellow-100 flex items-center gap-1">
              {applications.filter(a => a.status === 'pending').length} Menunggu
            </div>
            <div className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 flex items-center gap-1">
              {applications.filter(a => a.status === 'verified').length} Terverifikasi
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Informasi Pendaftar</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Skor AI</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                        {app.applicantName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{app.applicantName}</div>
                        <div className="text-xs text-gray-500 font-mono">ID: {app.id.substring(0, 8).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                      app.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{app.score || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedApp(app)}
                      className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
                    >
                      Buka Detail <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">
                    {loading ? 'Memuat data...' : 'Tidak ada data pengajuan yang ditemukan.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Verifikasi Detail Pendaftar</h2>
                  <p className="text-sm text-gray-500">Pastikan data fisik sesuai dengan data sistem.</p>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                     <div>
                       <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <FileText size={14} className="text-blue-600" /> Profil & Ekonomi
                       </h3>
                       <div className="space-y-4">
                         <div className="flex justify-between border-b border-gray-50 pb-2">
                           <span className="text-sm text-gray-500">Nama Lengkap</span>
                           <span className="text-sm font-bold text-gray-900">{selectedApp.applicantName}</span>
                         </div>
                         <div className="flex justify-between border-b border-gray-50 pb-2">
                           <span className="text-sm text-gray-500">NIK (KTP)</span>
                           <span className="text-sm font-bold text-gray-900">{selectedApp.nik}</span>
                         </div>
                         <div className="flex justify-between border-b border-gray-50 pb-2">
                           <span className="text-sm text-gray-500">Pendapatan</span>
                           <span className="text-sm font-bold text-green-600">{formatCurrency(selectedApp.income)}</span>
                         </div>
                         <div className="flex justify-between border-b border-gray-50 pb-2">
                           <span className="text-sm text-gray-500">Tanggungan</span>
                           <span className="text-sm font-bold text-gray-900">{selectedApp.dependents} Orang</span>
                         </div>
                         <div className="pt-2">
                           <span className="text-sm text-gray-500 block mb-1">Alamat</span>
                           <span className="text-sm font-medium text-gray-700 leading-relaxed">{selectedApp.address}</span>
                         </div>
                       </div>
                     </div>

                     <div>
                       <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <Brain size={14} className="text-purple-600" /> Hasil Penilaian
                       </h3>
                       {selectedApp.score ? (
                         <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                           <div className="flex items-end gap-2 mb-4">
                             <span className="text-4xl font-bold text-purple-700">{selectedApp.score}</span>
                             <span className="text-sm text-purple-400 font-bold mb-1">/ 100</span>
                           </div>
                           <p className="text-sm text-purple-800 leading-relaxed italic">"{selectedApp.aiAnalysis}"</p>
                         </div>
                       ) : (
                         <div className="bg-gray-50 p-8 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                           <p className="text-sm text-gray-400">Belum dianalisis oleh AI</p>
                         </div>
                       )}
                     </div>
                   </div>

                   <div className="space-y-8">
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Home size={14} className="text-orange-600" /> Kondisi Fisik Rumah
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Atap', value: selectedApp.housingConditions.roof },
                            { label: 'Dinding', value: selectedApp.housingConditions.walls },
                            { label: 'Lantai', value: selectedApp.housingConditions.floor },
                            { label: 'Fondasi', value: selectedApp.housingConditions.foundation },
                          ].map((item, i) => (
                            <div key={i} className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                              <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">{item.label}</div>
                              <div className="text-sm font-bold text-orange-900 capitalize">{item.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-8">
                        <button 
                          onClick={() => handleAnalyze(selectedApp)}
                          disabled={analyzing}
                          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-gray-400"
                        >
                          {analyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Menganalisis...
                            </>
                          ) : (
                            <>
                              <Brain size={20} />
                              Auto-Score dengan AI (Lengkap)
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-gray-400 text-center mt-3 leading-tight">Mekanisme penilaian otomatis ini akan menghitung skor kelayakan dan mengirimkan notifikasi ke pendaftar.</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
                 <button 
                  onClick={() => setSelectedApp(null)}
                  className="px-6 py-3 font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Tutup
                </button>
                 <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2">
                  Simpan Manual
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
