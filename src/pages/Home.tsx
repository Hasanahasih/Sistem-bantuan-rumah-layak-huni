import { motion } from 'motion/react';
import { ShieldCheck, Info, ArrowRight, UserPlus, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12 lg:pt-32 lg:pb-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center">
            <div className="w-full lg:w-1/2 px-4 mb-12 lg:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
                  <ShieldCheck size={14} /> Resmi & Terpercaya
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                  Sistem Informasi <br />
                  <span className="text-blue-600">Bantuan RTLH</span>
                </h1>
                <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
                  Platform digital profesional untuk pengajuan, verifikasi, dan penentuan penerimaan bantuan Rumah Tidak Layak Huni secara transparan dan akuntabel.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a 
                    href="/login" 
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-blue-200"
                  >
                    Mulai Sekarang <ArrowRight size={18} />
                  </a>
                  <button className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold py-4 px-8 rounded-xl transition-all">
                    Panduan Sistem <Info size={18} />
                  </button>
                </div>
              </motion.div>
            </div>
            
            <div className="w-full lg:w-1/2 px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-blue-100 rounded-3xl transform rotate-3 scale-105 opacity-50 blur-xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1000" 
                  alt="Rumah" 
                  className="relative rounded-3xl shadow-2xl z-10 w-full object-cover aspect-[4/3]"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Proses Transparan & Mudah</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Kami menggunakan teknologi AI untuk membantu verifikasi data dan penilaian kelayakan secara objektif.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Pendaftaran Online", 
                desc: "Warga dapat mengajukan permohonan bantuan secara mandiri dengan mengunggah data kondisi rumah.",
                icon: <UserPlus className="text-blue-600" />
              },
              { 
                title: "Verifikasi Lapangan", 
                desc: "Surveyor profesional akan melakukan pengecekan langsung untuk memvalidasi data pengajuan.",
                icon: <ClipboardList className="text-green-600" />
              },
              { 
                title: "Penilaian AI", 
                desc: "Sistem kecerdasan buatan membantu menganalisis kelayakan berdasarkan standar nasional.",
                icon: <CheckCircle className="text-purple-600" />
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-100">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Home className="text-blue-600" size={20} />
            <span className="font-bold text-lg text-gray-900">e-RTLH</span>
          </div>
          <div className="text-gray-500 text-sm">
            © 2026 e-RTLH Indonesia. Hak Cipta Dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
