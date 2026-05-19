import { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { RTLHApplication, UserProfile } from '@/src/types';
import { motion } from 'motion/react';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/src/lib/utils';

interface DashboardApplicantProps {
  profile: UserProfile;
}

export default function DashboardApplicant({ profile }: DashboardApplicantProps) {
  const [applications, setApplications] = useState<RTLHApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'applications'), where('applicantId', '==', profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RTLHApplication)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [profile.uid]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={20} />;
      case 'verified': return <AlertCircle className="text-blue-500" size={20} />;
      case 'approved': return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected': return <XCircle className="text-red-500" size={20} />;
      default: return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'verified': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return '';
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pusat Bantuan Anda</h1>
          <p className="text-gray-500">Pantau status pengajuan bantuan RTLH Anda di sini.</p>
        </div>
        {applications.length === 0 && (
          <a href="/apply" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2">
            <FileText size={18} /> Ajukan Baru
          </a>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : applications.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center"
        >
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-400">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Pengajuan</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Anda belum pernah mengajukan bantuan RTLH. Klik tombol di bawah untuk mulai mendaftar.</p>
          <a href="/apply" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all">
            Buat Pengajuan Sekarang
          </a>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map((app) => (
            <motion.div 
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                    <Home size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nomor Pengajuan</div>
                    <div className="text-sm font-mono font-bold text-gray-700">{app.id.substring(0, 8).toUpperCase()}</div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 ${getStatusClass(app.status)}`}>
                  {getStatusIcon(app.status)}
                  {app.status.toUpperCase()}
                </div>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detail Rumah</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Atap:</span>
                      <span className="text-sm font-bold text-gray-900 capitalize">{app.housingConditions.roof}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Dinding:</span>
                      <span className="text-sm font-bold text-gray-900 capitalize">{app.housingConditions.walls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Lantai:</span>
                      <span className="text-sm font-bold text-gray-900 capitalize">{app.housingConditions.floor}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detail Ekonomi</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Pendapatan:</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(app.income)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Tanggungan:</span>
                      <span className="text-sm font-bold text-gray-900">{app.dependents} Orang</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col justify-center items-center text-center">
                   <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Skor Kelayakan (AI)</h4>
                   <div className="text-4xl font-bold text-blue-600 mt-2">{app.score || '-'}</div>
                   <p className="text-[10px] text-blue-400 mt-2 leading-tight">Skor akan muncul setelah verifikasi data oleh surveyor.</p>
                </div>
              </div>
              
              {app.aiAnalysis && (
                <div className="px-8 pb-8">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <CheckCircle size={12} /> Catatan Analisis Sistem
                    </div>
                    <p className="text-sm text-gray-600 italic">"{app.aiAnalysis}"</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
