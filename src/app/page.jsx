"use client";

import { 
  Phone, 
  Clock, 
  Activity, 
  Shield, 
  User, 
  MessageCircle, 
  Award, 
  CheckCircle, 
  ArrowRight 
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Impor komponen UI
import DoctorScheduleSection from "../components/guest/DoctorSchedule"; 
import Footer from "../components/guest/Footer";
import { Navbar, TopBar } from "../components/guest/Header";

export default function Home() {
  const [activeSection, setActiveSection] = useState("beranda");
  const observer = useRef(null);

  // --- DATA STATIS (Frontend Only) ---
  const features = [
    {
      title: "Reservasi 24/7",
      desc: "Akses reservasi kapan saja dan di mana saja. Sistem online tersedia 24 jam.",
      icon: <Clock className="w-8 h-8 text-[#8CC63F]" />,
    },
    {
      title: "AI Diagnosis",
      desc: "Teknologi AI membantu merekomendasikan poli yang tepat berdasarkan gejala Anda.",
      icon: <Activity className="w-8 h-8 text-[#8CC63F]" />,
    },
    {
      title: "Integrasi Asuransi",
      desc: "Mendukung berbagai jenis asuransi kesehatan termasuk BPJS.",
      icon: <Shield className="w-8 h-8 text-[#8CC63F]" />,
    },
    {
      title: "Dokter Berpengalaman",
      desc: "Tim medis profesional siap memberikan pelayanan kesehatan terbaik.",
      icon: <User className="w-8 h-8 text-[#8CC63F]" />,
    },
    {
      title: "Chat Real-time",
      desc: "Berkomunikasi langsung dengan admin untuk konsultasi dan informasi.",
      icon: <MessageCircle className="w-8 h-8 text-[#8CC63F]" />,
    },
    {
      title: "Akreditasi Lengkap",
      desc: "Rumah sakit terakreditasi dengan standar pelayanan tinggi dan terpercaya.",
      icon: <Award className="w-8 h-8 text-[#8CC63F]" />,
    },
  ];

  // --- LOGIKA UI: SCROLL SPY (Untuk Navigasi) ---
  useEffect(() => {
    // Observer untuk mendeteksi section mana yang sedang dilihat user
    const options = { root: null, rootMargin: "-40% 0px -60% 0px", threshold: 0 };
    
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, options);

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.current?.observe(section));

    return () => sections.forEach((section) => observer.current?.unobserve(section));
  }, []);

  return (
    <main className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-800">
      {/* Header Components */}
      <TopBar />
      <Navbar activeSection={activeSection} />

      {/* --- 1. HERO SECTION --- */}
      <section id="beranda" className="relative bg-[#003B73] text-white pt-24 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          
          {/* Teks Kiri */}
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Reservasi <br/> Online
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-md">
              Bagi pasien Pribadi, Asuransi, dan Perusahaan. Akses layanan kesehatan prioritas kini dalam genggaman.
            </p>
            
            {/* Widget Call Center */}
            <div className="bg-white text-[#003B73] p-4 rounded-2xl shadow-lg inline-flex items-center gap-4 max-w-md w-full">
              <div className="bg-[#8CC63F] p-3 rounded-full">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Call Center</p>
                <p className="text-2xl font-extrabold">150-442</p>
                <p className="text-[10px] text-slate-400">Senin - Minggu, 24 Jam</p>
              </div>
            </div>
          </div>

          {/* Gambar Kanan (Hero Section) */}
          <div className="relative z-10 hidden md:block">
            <div className="relative rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
               <img 
                 src="/images/gambar1.svg" 
                 alt="Ilustrasi Rumah Sakit" 
                 className="w-full h-80 object-cover bg-white"
               />
               <div className="absolute inset-0 bg-[#003B73]/10"></div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-white/5 skew-x-12 pointer-events-none"></div>
      </section>

      {/* --- 2. FLOATING SEARCH SCHEDULE --- */}
      <div className="max-w-6xl mx-auto px-4 relative z-20 -mt-20 lg:-mt-32 mb-16">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
           {/* Header Form */}
           <div className="bg-white px-8 py-6 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-[#003B73]">Cari Jadwal Dokter</h2>
              <p className="text-slate-500 text-sm mt-1">Temukan jadwal dokter, booking, dan atur janji dengan dokter ahli.</p>
           </div>
           
           {/* Komponen Form Jadwal */}
           <div className="p-2 md:p-6">
              <DoctorScheduleSection /> 
           </div>
        </div>
      </div>

      {/* --- 3. BANNER BIRU --- */}
      <section className="bg-[#003B73] py-12 px-6 text-center mb-20">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Karena Kebutuhan Anda Prioritas Kami
            </h2>
            <p className="text-blue-200 text-sm">Melayani dengan sepenuh hati untuk kesehatan Anda.</p>
         </div>
      </section>

      {/* --- 4. MENGAPA MEMILIH KAMI --- */}
      <section id="tentang" className="max-w-7xl mx-auto px-6 pb-24 scroll-mt-28">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-bold text-[#003B73] mb-4">Mengapa Memilih RSPB?</h2>
           <div className="w-20 h-1.5 bg-[#8CC63F] mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 flex items-start gap-4 transition-all duration-300"
            >
              <div className="bg-slate-50 p-3 rounded-xl shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-[#003B73] text-lg mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- 5. FASILITAS MODERN --- */}
      <section id="fasilitas" className="bg-white py-20 scroll-mt-28">
         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            {/* Gambar Fasilitas */}
            <div className="order-2 lg:order-1">
               <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src="/images/gambar1.svg" 
                    alt="Ilustrasi Fasilitas RS" 
                    className="w-full h-full object-cover bg-white"
                  />
               </div>
            </div>

            {/* Teks & Checklist */}
            <div className="order-1 lg:order-2">
               <h2 className="text-3xl font-bold text-[#003B73] mb-4">Fasilitas Modern & Nyaman</h2>
               <p className="text-slate-600 mb-8 leading-relaxed">
                 RS kami dilengkapi dengan fasilitas medis terkini dan ruang tunggu yang nyaman untuk menunjang kesembuhan pasien dan kenyamanan keluarga.
               </p>
               
               <ul className="space-y-4 mb-8">
                  {[
                    "Ruang perawatan dengan peralatan medis terkini",
                    "Laboratorium dan radiologi yang lengkap",
                    "Ruang tunggu yang nyaman dan ber-AC",
                    "Parkir luas dan mudah diakses"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                       <CheckCircle className="w-5 h-5 text-[#8CC63F] shrink-0" />
                       {item}
                    </li>
                  ))}
               </ul>

               <a href="/auth/reservasi" className="inline-flex items-center gap-2 bg-[#8CC63F] hover:bg-[#7ab332] text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-lg shadow-lime-200/50">
                  Buat Reservasi Sekarang <ArrowRight className="w-5 h-5" />
               </a>
            </div>
         </div>
      </section>

      {/* --- 6. CTA HIJAU --- */}
      <section className="px-6 py-12">
         <div className="max-w-5xl mx-auto bg-[#8CC63F] rounded-3xl p-8 md:p-12 text-center shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-2">Siap Untuk Memulai?</h2>
              <p className="text-white/90 mb-8">Daftar sekarang dan nikmati kemudahan reservasi online 24/7.</p>
              
              <a href="/auth/register" className="inline-block bg-white text-[#8CC63F] font-bold py-4 px-12 rounded-xl hover:bg-slate-50 transition-transform hover:scale-105 shadow-md">
                 Daftar Sekarang
              </a>
            </div>
            
            {/* Decoration */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
         </div>
      </section>

      {/* --- 7. FOOTER --- */}
      <Footer />
    </main>
  );
}