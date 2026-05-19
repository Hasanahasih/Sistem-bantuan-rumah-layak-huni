import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile, UserRole } from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardSurveyor from './pages/DashboardSurveyor';
import DashboardApplicant from './pages/DashboardApplicant';
import ApplicationForm from './pages/ApplicationForm';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create user profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          // Default role for new users is applicant
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || 'Pendaftar',
            role: 'applicant',
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {user && profile && <Navbar role={profile.role} displayName={profile.displayName} />}
      <div className={user ? "pt-20" : ""}>
        <Routes>
          <Route path="/" element={!user ? <Home /> : <Navigate to={`/${profile?.role}`} />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${profile?.role}`} />} />
          
          <Route 
            path="/admin" 
            element={user && profile?.role === 'admin' ? <DashboardAdmin /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/surveyor" 
            element={user && profile?.role === 'surveyor' ? <DashboardSurveyor /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/applicant" 
            element={user && profile?.role === 'applicant' ? <DashboardApplicant profile={profile} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/apply" 
            element={user && profile?.role === 'applicant' ? <ApplicationForm profile={profile} /> : <Navigate to="/login" />} 
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
