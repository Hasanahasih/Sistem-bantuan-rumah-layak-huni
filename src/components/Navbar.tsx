import { auth } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, Home, FileText, ClipboardList, Shield, User } from 'lucide-react';
import { UserRole } from '@/src/types';

interface NavbarProps {
  role?: UserRole;
  displayName?: string;
}

export default function Navbar({ role, displayName }: NavbarProps) {
  const handleLogout = () => signOut(auth);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-bottom border-gray-100 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        <Home className="text-blue-600" size={24} />
        <span className="font-bold text-xl tracking-tight text-gray-900">e-RTLH</span>
      </div>
      
      <div className="flex items-center gap-6">
        {role === 'admin' && (
          <a href="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1">
            <Shield size={16} /> Panel Admin
          </a>
        )}
        {role === 'surveyor' && (
          <a href="/surveyor" className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1">
            <ClipboardList size={16} /> Survei
          </a>
        )}
        {role === 'applicant' && (
          <a href="/applicant" className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1">
            <FileText size={16} /> Permohonan
          </a>
        )}

        <div className="h-6 w-px bg-gray-200 ml-2" />
        
        <div className="flex items-center gap-3 ml-2">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-gray-900">{displayName || 'User'}</div>
            <div className="text-xs text-gray-500 capitalize">{role || 'Tamu'}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Keluar"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
