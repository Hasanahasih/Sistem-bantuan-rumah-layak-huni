import { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { RTLHApplication, UserProfile, UserRole } from '@/src/types';
import { motion } from 'motion/react';
import { Users, FileCheck, TrendingUp, Filter, CheckCircle, XCircle, UserCog, Database } from 'lucide-react';
import { formatCurrency } from '@/src/lib/utils';

export default function DashboardAdmin() {
  const [applications, setApplications] = useState<RTLHApplication[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'applications' | 'users'>('applications');

  useEffect(() => {
    const qApps = query(collection(db, 'applications'), orderBy('score', 'desc'));
    const unsubscribeApps = onSnapshot(qApps, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RTLHApplication)));
    });

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      setLoading(false);
    });

    return () => {
      unsubscribeApps();
      unsubscribeUsers();
    };
  }, []);

  const handleUpdateStatus = async (appId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'applications', appId), { 
        status, 
        updatedAt: new Date().toISOString() 
      });
      
      const app = applications.find(a => a.id === appId);
      const applicant = users.find(u => u.uid === app?.applicantId);
      
      if (applicant) {
        await fetch('/api/email/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: applicant.email,
            subject: `Pemberitahuan Status Bantuan RTLH: ${status.toUpperCase()}`,
            body: `Halo <b>${app?.applicantName}</b>, Permohonan bantuan RTLH Anda telah dinyatakan <b>${status.toUpperCase()}</b> oleh administrator.`
          })
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (uid: string, role: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (err) {
      console.error(err);
    }
  };

  const stats = {
    total: applications.length,
    approved: applications.filter(a => a.status === 'approved').length,
    pending: applications.filter(a => a.status === 'pending' || a.status === 'verified').length,
    highPriority: applications.filter(a => a.score >= 80).length
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel Administrator</h1>
          <p className="text-gray-500">Manajemen pusat bantuan RTLH, pengguna, dan penetapan penerima.</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setView('applications')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${view === 'applications' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <FileCheck size={18} /> Permohonan
          </button>
          <button 
            onClick={() => setView('users')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${view === 'users' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Users size={18} /> Pengguna
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Pengajuan', val: stats.total, icon: <FileCheck />, color: 'blue' },
          { label: 'Telah Disetujui', val: stats.approved, icon: <CheckCircle />, color: 'green' },
          { label: 'Masih Proses', val: stats.pending, icon: <TrendingUp />, color: 'orange' },
          { label: 'Prioritas Tinggi', val: stats.highPriority, icon: <Database />, color: 'purple' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center shrink-0`}>
              {s.icon}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">{s.label}</div>
              <div className="text-3xl font-black text-gray-900">{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {view === 'applications' ? (
          <div>
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Filter size={18} className="text-blue-600" /> Daftar Prioritas Penetapan
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/30">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Pendaftar</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Skor LKL</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Alamat</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Penetapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{app.applicantName}</div>
                          <div className="text-xs text-gray-400">NIK: {app.nik}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-lg font-black ${app.score >= 80 ? 'text-red-600' : 'text-blue-600'}`}>
                          {app.score || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-500">
                        {app.address}
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${
                            app.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                            app.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-gray-50 text-gray-500 border-gray-100'
                          }`}>
                            {app.status}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {app.status !== 'approved' && app.status !== 'rejected' && app.score > 0 ? (
                          <div className="flex justify-end gap-2">
                             <button 
                              onClick={() => handleUpdateStatus(app.id, 'approved')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
                              title="Setujui"
                            >
                              <CheckCircle size={18} />
                            </button>
                             <button 
                              onClick={() => handleUpdateStatus(app.id, 'rejected')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                              title="Tolak"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 font-bold uppercase italic">Finalized</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <UserCog size={18} className="text-blue-600" /> Manajemen Hak Akses Pengguna
              </h2>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/30">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Pengguna</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role Saat Ini</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ubah Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50/50 transition-all">
                      <td className="px-6 py-4 font-bold text-gray-900">{u.displayName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select 
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.uid, e.target.value as UserRole)}
                          className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="applicant">Applicant</option>
                          <option value="surveyor">Surveyor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
