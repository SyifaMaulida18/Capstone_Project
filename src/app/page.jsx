"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Impor komponen-komponen yang sudah dipisah menggunakan path relatif
import DoctorScheduleSection from "../components/guest/DoctorSchedule";
import CallToAction from "../components/guest/CallToAction";
import Footer from "../components/guest/Footer";
import { Navbar, TopBar } from "../components/guest/Header";

export default function Home() {
    const placeholderImage = "https://placehold.co/80x80/6366f1/ffffff?text=U";
    
    const testimonials = [
      { id: 1, name: "Jaka, 35 Tahun", text: "Sekarang reservasi ke dokter jadi lebih mudah. Tidak perlu antre lama di rumah sakit. Sangat membantu!", img: placeholderImage },
      { id: 2, name: "Sinta, 28 Tahun", text: "Sistemnya cepat dan notifikasinya real-time. Cocok untuk orang sibuk seperti saya.", img: placeholderImage },
      { id: 3, name: "Rizal, 41 Tahun", text: "Rekomendasi poli berdasarkan gejala sangat akurat. Saya bisa langsung diarahkan ke dokter yang tepat.", img: placeholderImage },
    ];

    const [index, setIndex] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // State untuk melacak section yang aktif
    const [activeSection, setActiveSection] = useState('beranda');
    const observer = useRef(null);

    useEffect(() => {
        // Logika untuk testimonial dan login
        const interval = setInterval(() => setIndex((prev) => (prev + 1) % testimonials.length), 5000);
        if (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true') {
            setIsLoggedIn(true);
        }

        // --- Logika Intersection Observer untuk Scroll Spy ---
        const options = {
            root: null, // viewport
            rootMargin: '-40% 0px -60% 0px', // trigger di tengah layar
            threshold: 0
        };
        
        observer.current = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, options);

        // Mengamati semua section yang memiliki id
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
          if (observer.current) {
            observer.current.observe(section);
          }
        });

        // Cleanup function
        return () => {
            clearInterval(interval);
            sections.forEach(section => {
                if(observer.current) {
                    observer.current.unobserve(section);
                }
            });
        };
    }, [testimonials.length]);

    const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
    const prev = () => setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));

    return (
        <main className="bg-white min-h-screen flex flex-col text-gray-800 font-sans">
            <TopBar />
            <Navbar activeSection={activeSection} />

            {/* Hero Section */}
            <section id="beranda" className="relative overflow-hidden flex items-center justify-center text-center p-6 py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-100 scroll-mt-28">
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-gray-900 leading-tight">
                        Reservasi Dokter, <br /> Praktis dan Tanpa Antre
                    </h2>
                    <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                        Atur jadwal kedatangan, pilih poli, dan dapatkan dokter sesuai
                        kebutuhan Anda dengan mudah, kapan saja, di mana saja.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <a
                            href={isLoggedIn ? "/reservasi" : "/login"}
                            className="px-8 py-4 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                        >
                            {isLoggedIn ? "Mulai Reservasi Sekarang" : "Login untuk Reservasi"}
                        </a>
                        <div className="flex gap-3 mt-4 sm:mt-0">
                             <img src="https://placehold.co/150x45/4f46e5/ffffff?text=AppStore" alt="App Store" className="h-12 w-auto object-contain" />
                             <img src="https://placehold.co/150x45/4f46e5/ffffff?text=PlayStore" alt="Play Store" className="h-12 w-auto object-contain" />
                        </div>
                    </div>
                </div>
                <div className="absolute inset-0 z-0">
                    <div className="bg-blue-200 opacity-30 w-full h-full animate-pulse-fast"></div>
                </div>
            </section>
            
            {/* Memanggil Komponen Jadwal Dokter */}
            <DoctorScheduleSection />
            
            {/* Fitur Unggulan */}
            <section id="fitur-unggulan" className="grid md:grid-cols-3 gap-8 px-6 py-16 max-w-6xl mx-auto relative z-20 scroll-mt-28">
                {[
                    { title: "Reservasi Online 24/7", desc: "Lakukan reservasi kapanpun dan dimanapun tanpa batas waktu. Akses mudah dari smartphone atau desktop.", icon: "⏰" },
                    { title: "Rekomendasi Poli Cerdas", desc: "Sistem cerdas kami membantu memberikan rekomendasi poli yang paling sesuai dengan gejala Anda.", icon: "🧠" },
                    { title: "Notifikasi Jadwal Real-Time", desc: "Dapatkan pengingat jadwal dokter dan informasi penting agar tidak ada janji yang terlewatkan.", icon: "🔔" },
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                        <div className="text-4xl mb-4 text-center">{item.icon}</div>
                        <h3 className="font-bold text-xl mb-2 text-blue-800 text-center">{item.title}</h3>
                        <p className="text-gray-600 text-center">{item.desc}</p>
                    </div>
                ))}
            </section>

            {/* Manfaat */}
            <section id="manfaat" className="px-6 py-20 bg-gray-50 scroll-mt-28">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                        Manfaat Utama Sistem Reservasi Kami
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            "Akses di Mana Saja",
                            "Pendaftaran Mudah & Cepat",
                            "Rekomendasi Poli Otomatis",
                            "Notifikasi Real-Time",
                            "Riwayat Pasien Tersimpan",
                            "Sistem Terintegrasi",
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 hover:bg-blue-50 transition-colors duration-300"
                            >
                                <div className="bg-blue-500 text-white rounded-full p-2">
                                    <Star className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-lg text-gray-800">{item}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimoni */}
            <section id="testimoni" className="bg-white py-20 text-center relative overflow-hidden scroll-mt-28">
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900">
                        Apa Kata Mereka?
                    </h2>
                    <div className="relative flex justify-center items-center gap-4">
                        <button
                            onClick={prev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white shadow-lg p-3 rounded-full hover:bg-blue-600 transition-all duration-300 z-20 hidden sm:block"
                        >
                            <ChevronLeft className="w-7 h-7" />
                        </button>

                        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 w-full mx-8 md:w-[600px] transform transition-all duration-500 ease-in-out">
                            <img
                                src={testimonials[index].img || placeholderImage}
                                alt={testimonials[index].name}
                                className="w-20 h-20 mx-auto rounded-full object-cover mb-6 border-4 border-blue-200"
                            />
                            <p className="text-gray-700 italic text-lg mb-4 leading-relaxed">
                                “{testimonials[index].text}”
                            </p>
                            <p className="font-bold text-blue-800 text-lg">
                                {testimonials[index].name}
                            </p>
                        </div>

                        <button
                            onClick={next}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white shadow-lg p-3 rounded-full hover:bg-blue-600 transition-all duration-300 z-20 hidden sm:block"
                        >
                            <ChevronRight className="w-7 h-7" />
                        </button>
                    </div>
                </div>
            </section>
            
            {/* Memanggil Komponen CallToAction */}
            <CallToAction />
            
            {/* Memanggil Komponen Footer */}
            <Footer />
        </main>
    );
}

