import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, HousingConditions } from '@/src/types';
import { motion } from 'motion/react';
import { Send, Home, Info } from 'lucide-react';

interface ApplicationFormProps {
  profile: UserProfile;
}

export default function ApplicationForm({ profile }: ApplicationFormProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    applicantName: profile.displayName,
    nik: '',
    address: '',
    phone: '',
    income: 0,
    dependents: 0,
    housingConditions: {
      foundation: 'good',
      walls: 'permanent',
      roof: 'tile',
      floor: 'ceramic'
    } as HousingConditions
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await addDoc(collection(db, 'applications'), {
        ...formData,
        applicantId: profile.uid,
        status: 'pending',
        score: 0,
        aiAnalysis: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      navigate('/applicant');
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Formulir Pengajuan Bantuan</h1>
          <p className="text-gray-500">Lengkapi data Anda dengan benar untuk diproses oleh sistem.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
              <input 
                type="text" 
                value={formData.applicantName}
                onChange={e => setFormData({...formData, applicantName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">NIK (Sesuai KTP)</label>
              <input 
                type="text" 
                value={formData.nik}
                onChange={e => setFormData({...formData, nik: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Lengkap</label>
            <textarea 
              rows={3}
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Telepon / WhatsApp</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pendapatan Bulanan</label>
              <input 
                type="number" 
                value={formData.income}
                onChange={e => setFormData({...formData, income: parseInt(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Jumlah Tanggungan</label>
              <input 
                type="number" 
                value={formData.dependents}
                onChange={e => setFormData({...formData, dependents: parseInt(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Home size={20} className="text-blue-600" /> Kondisi Awal Rumah (Self Assessment)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fondasi</label>
                <select 
                  value={formData.housingConditions.foundation}
                  onChange={e => setFormData({...formData, housingConditions: {...formData.housingConditions, foundation: e.target.value as any}})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                >
                  <option value="good">Baik</option>
                  <option value="damaged">Rusak / Retak</option>
                  <option value="none">Tidak Ada / Sangat Parah</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Dinding</label>
                <select 
                   value={formData.housingConditions.walls}
                   onChange={e => setFormData({...formData, housingConditions: {...formData.housingConditions, walls: e.target.value as any}})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                >
                  <option value="permanent">Tembok Permanen</option>
                  <option value="semi-permanent">Semi Permanen</option>
                  <option value="wood">Kayu / Papan</option>
                  <option value="bamboo">Bambu / Anyaman</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Atap</label>
                <select 
                   value={formData.housingConditions.roof}
                   onChange={e => setFormData({...formData, housingConditions: {...formData.housingConditions, roof: e.target.value as any}})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                >
                  <option value="tile">Genteng</option>
                  <option value="zinc">Seng</option>
                  <option value="asbestos">Asbes</option>
                  <option value="thatch">Rumbia / Ijuk</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Lantai</label>
                <select 
                   value={formData.housingConditions.floor}
                   onChange={e => setFormData({...formData, housingConditions: {...formData.housingConditions, floor: e.target.value as any}})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                >
                  <option value="ceramic">Keramik</option>
                  <option value="cement">Semen / Plester</option>
                  <option value="wood">Kayu / Papan</option>
                  <option value="soil">Tanah</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl flex items-start gap-3 mt-8">
            <Info className="text-yellow-600 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-yellow-800">
              Pastikan semua data yang diisi benar. Data palsu dapat menyebabkan permohonan Anda dibatalkan secara otomatis oleh sistem.
            </p>
          </div>

          <button 
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {submitting ? 'Mengirim...' : <><Send size={18} /> Kirim Pengajuan</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
