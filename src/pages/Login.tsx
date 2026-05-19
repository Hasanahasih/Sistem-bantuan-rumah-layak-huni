import { auth, db } from '@/src/lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { LogIn, Key, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Login() {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-6">
              <LogIn size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h1>
            <p className="text-gray-500">Silakan masuk untuk mengakses sistem bantuan RTLH.</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Masuk dengan Google
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Informasi Akun Demo</h3>
            <div className="grid grid-cols-1 gap-3 text-xs">
              <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3">
                <Shield className="text-blue-600" size={16} />
                <div>
                  <p className="font-bold text-blue-900 uppercase">Admin</p>
                  <p className="text-blue-700 opacity-70">Admin memiliki akses penuh untuk manajemen bantuan.</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3">
                <Key className="text-green-600" size={16} />
                <div>
                  <p className="font-bold text-green-900 uppercase">Surveyor</p>
                  <p className="text-green-700 opacity-70">Surveyor bertugas memverifikasi kondisi rumah di lapangan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
