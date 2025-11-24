"use client";

import { Building, HeartHandshake, Lightbulb, Target, Users } from "lucide-react";

// Memperbaiki path relatif untuk mengimpor komponen (sesuaikan jika perlu)
import CallToAction from "../../../components/guest/CallToAction"; 
import Footer from "../../../components/guest/Footer";
import { Navbar, TopBar } from "../../../components/guest/Header";

// Komponen Card untuk menampilkan nilai-nilai utama
const ValueCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-[#8CC63F] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
      {/* Icon Wrapper: Background Biru Pudar, Icon Hijau */}
      <div className="mb-6 mx-auto w-16 h-16 flex items-center justify-center bg-blue-50 rounded-full group-hover:bg-[#003B73] transition-colors duration-300">
        <div className="text-[#003B73] group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
      </div>
      
      <h3 className="font-bold text-xl mb-3 text-[#003B73] text-center">{title}</h3>
      <p className="text-slate-600 text-center leading-relaxed">{description}</p>
    </div>
  );
};

export default function TentangPage() {
  // Placeholder untuk data tim dokter
  const doctors = [
    { name: "Dr. Iqbal Sp.JP", speciality: "Spesialis Jantung", image: "https://placehold.co/150x150/003B73/FFFFFF?text=Dr.+I" },
    { name: "Dr. Leda Sp.A", speciality: "Spesialis Anak", image: "https://placehold.co/150x150/003B73/FFFFFF?text=Dr.+L" },
    { name: "Dr. Kore Sp.PD", speciality: "Spesialis Penyakit Dalam", image: "https://placehold.co/150x150/003B73/FFFFFF?text=Dr.+K" },
  ];

  return (
    <main className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-800">
      <TopBar />
      <Navbar activeSection="tentang" /> {/* Mengaktifkan state 'tentang' di Navbar */}

      {/* --- 1. HERO SECTION (Konsisten dengan Home: Biru Solid) --- */}
      <section className="relative bg-[#003B73] text-white py-20 md:py-32 text-center overflow-hidden">
        {/* Background Pattern Halus */}
        <div className="absolute top-0 right-0 w-full h-full bg-white/5 opacity-30 skew-y-12 pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <span className="text-[#8CC63F] font-bold tracking-wider uppercase text-sm mb-4 block">Profil Rumah Sakit</span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Tentang Kami
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Dedikasi kami untuk memberikan layanan kesehatan prioritas yang mudah diakses, modern, dan terpercaya bagi keluarga Indonesia.
          </p>
        </div>
      </section>

      {/* --- 2. VISI DAN MISI --- */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="text-center md:text-left order-2 md:order-1">
            <div className="inline-block px-4 py-1 bg-blue-50 text-[#003B73] rounded-full text-sm font-bold mb-4 border border-blue-100">
              Visi & Misi
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#003B73] mb-6">
              Mewujudkan Layanan Kesehatan Masa Depan
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed text-lg">
              Visi kami adalah menjadi ekosistem kesehatan digital terdepan yang menghubungkan pasien dengan tenaga medis profesional tanpa batasan waktu dan tempat.
            </p>
            
            <div className="space-y-4">
               <div className="flex gap-4">
                 <div className="w-1 bg-[#8CC63F] rounded-full shrink-0"></div>
                 <p className="text-slate-600">Menyederhanakan alur pendaftaran pasien dengan teknologi AI.</p>
               </div>
               <div className="flex gap-4">
                 <div className="w-1 bg-[#8CC63F] rounded-full shrink-0"></div>
                 <p className="text-slate-600">Menyediakan transparansi jadwal dan ketersediaan dokter secara real-time.</p>
               </div>
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="order-1 md:order-2 relative">
             <div className="absolute -inset-4 bg-[#8CC63F]/20 rounded-3xl -rotate-2"></div>
             <img
              src="/images/gambar1.svg"
              alt="Visi dan Misi"
              className="relative rounded-2xl shadow-xl w-full h-auto object-cover border border-slate-100"
            />
          </div>
        </div>
      </section>

      {/* --- 3. NILAI UTAMA (Values) --- */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#003B73] mb-4">
              Nilai Utama Kami
            </h2>
            <div className="w-24 h-1.5 bg-[#8CC63F] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValueCard
              icon={<HeartHandshake size={32} />}
              title="Peduli Pasien"
              description="Empati adalah dasar pelayanan kami. Kebutuhan pasien selalu menjadi prioritas utama."
            />
            <ValueCard
              icon={<Target size={32} />}
              title="Efisiensi Tinggi"
              description="Proses digital yang cepat memangkas waktu tunggu administrasi yang tidak perlu."
            />
            <ValueCard
              icon={<Lightbulb size={32} />}
              title="Inovasi Digital"
              description="Terus mengembangkan teknologi terbaru untuk diagnosa dan reservasi yang akurat."
            />
            <ValueCard
              icon={<Building size={32} />}
              title="Fasilitas Lengkap"
              description="Didukung infrastruktur medis modern berstandar internasional."
            />
          </div>
        </div>
      </section>

      {/* --- 4. TIM KAMI --- */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#003B73]">
            Tim Medis Profesional
          </h2>
          <p className="text-slate-600 mb-12 max-w-2xl mx-auto">
            Kami bangga memiliki tim dokter spesialis yang berpengalaman dan berdedikasi tinggi.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {doctors.map((doctor, index) => (
              <div key={index} className="flex flex-col items-center p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[#8CC63F] rounded-full blur opacity-20 transform translate-y-2"></div>
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  {/* Badge Verified Kecil */}
                  <div className="absolute bottom-1 right-1 bg-[#003B73] p-1.5 rounded-full border-2 border-white">
                     <Users size={12} className="text-white"/>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-[#003B73]">{doctor.name}</h3>
                <p className="text-[#8CC63F] font-medium text-sm mt-1 uppercase tracking-wide">{doctor.speciality}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-blue-50 rounded-2xl inline-block">
             <p className="text-slate-600">
               ... dan puluhan tenaga medis profesional lainnya yang siap melayani Anda.
             </p>
          </div>
        </div>
      </section>

      {/* Pastikan path ini benar sesuai struktur folder kamu */}
      <CallToAction /> 
      <Footer />
    </main>
  );
}