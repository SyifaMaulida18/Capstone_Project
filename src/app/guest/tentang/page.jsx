"use client";

import { Building, HeartHandshake, Lightbulb, Target } from 'lucide-react';

// Memperbaiki path relatif untuk mengimpor komponen
import CallToAction from "../../../components/guest/CallToAction";
import Footer from "../../../components/guest/Footer";
import { Navbar, TopBar } from "../../../components/guest/Header";

// Komponen Card untuk menampilkan nilai-nilai utama
const ValueCard = ({ icon, title, description }) => {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-blue-600 mb-4 mx-auto w-fit p-3 bg-blue-100 rounded-full">
                {icon}
            </div>
            <h3 className="font-bold text-xl mb-2 text-blue-800 text-center">{title}</h3>
            <p className="text-gray-600 text-center">{description}</p>
        </div>
    );
};


export default function TentangPage() {
    // Placeholder untuk data tim dokter
    const doctors = [
        { name: "Dr. Iqbal Sp.JP", speciality: "Spesialis Jantung", image: "https://placehold.co/150x150/e0e7ff/4f46e5?text=Dr.+I" },
        { name: "Dr. Leda Sp.A", speciality: "Spesialis Anak", image: "https://placehold.co/150x150/e0e7ff/4f46e5?text=Dr.+L" },
        { name: "Dr. Kore Sp.PD", speciality: "Spesialis Penyakit Dalam", image: "https://placehold.co/150x150/e0e7ff/4f46e5?text=Dr.+K" },
    ];

    return (
        <main className="bg-white min-h-screen flex flex-col text-gray-800 font-sans">
            {/* Menggunakan komponen Header yang sudah ada */}
            <TopBar />
            <Navbar activeSection={''} /> {/* activeSection dikosongkan karena ini halaman statis */}

            {/* Hero Section untuk Halaman Tentang */}
            <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 md:py-32 text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        Tentang Kami
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Memberikan kemudahan akses layanan kesehatan untuk Anda dan keluarga melalui teknologi terdepani.
                    </p>
                </div>
            </section>

            {/* Visi dan Misi */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-center md:text-left">
                        <span className="text-blue-600 font-semibold">Visi & Misi</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                            Mewujudkan Layanan Kesehatan yang Lebih Baik
                        </h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Visi kami adalah menjadi platform reservasi kesehatan terdepan yang memberikan kemudahan dan kenyamanan bagi setiap pasien di Indonesia.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Misi kami adalah menyederhanakan alur pendaftaran, menyediakan informasi jadwal yang akurat, dan mengintegrasikan teknologi untuk terus meningkatkan kualitas layanan.
                        </p>
                    </div>
                    <div>
                        {/* Ganti dengan URL gambar yang relevan */}
                        <img 
                            src="https://placehold.co/600x400/e0e7ff/4f46e5?text=Visi+%26+Misi" 
                            alt="Visi dan Misi" 
                            className="rounded-2xl shadow-xl w-full h-auto object-cover"
                        />
                    </div>
                </div>
            </section>
            
            {/* Nilai-nilai Kami */}
            <section className="bg-gray-50 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                     <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                        Nilai Utama Kami
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                       <ValueCard 
                           icon={<HeartHandshake size={32} />}
                           title="Berpusat pada Pasien"
                           description="Kami menempatkan kebutuhan dan kenyamanan pasien sebagai prioritas utama dalam setiap inovasi."
                       />
                       <ValueCard 
                           icon={<Target size={32} />}
                           title="Efisiensi"
                           description="Mengurangi waktu tunggu dan menyederhanakan proses agar pengalaman Anda lebih efisien."
                       />
                       <ValueCard 
                           icon={<Lightbulb size={32} />}
                           title="Inovasi Berkelanjutan"
                           description="Selalu mencari cara baru untuk meningkatkan layanan kami melalui teknologi terkini."
                       />
                       <ValueCard 
                           icon={<Building size={32} />}
                           title="Kemitraan Terpercaya"
                           description="Bekerja sama dengan fasilitas kesehatan terbaik untuk memberikan layanan yang andal."
                       />
                    </div>
                </div>
            </section>

            {/* Tim Kami (Contoh) */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900">
                        Didukung oleh Tim Profesional
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {doctors.map((doctor, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <img 
                                    src={doctor.image} 
                                    alt={doctor.name} 
                                    className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-200"
                                />
                                <h3 className="font-bold text-lg text-gray-800">{doctor.name}</h3>
                                <p className="text-blue-600 font-medium">{doctor.speciality}</p>
                            </div>
                        ))}
                    </div>
                     <p className="mt-8 text-gray-600">... dan puluhan tenaga medis profesional lainnya yang siap melayani Anda.</p>
                </div>
            </section>
            
            {/* Menggunakan komponen yang sudah ada */}
            <CallToAction />
            <Footer />
        </main>
    );
}

