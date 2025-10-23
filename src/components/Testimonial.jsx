// components/Testimonial.jsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Testimonial({ isLoggedIn }) {
  // === Perubahan 1: State untuk menyimpan data testimoni dari backend
  const [testimonials, setTestimonials] = useState([]);
  const [index, setIndex] = useState(0);
  const placeholderImage = "/images/user-placeholder.png";

  useEffect(() => {
    // === Perubahan 2: Mengambil data testimoni dari API backend
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("https://api-anda.com/testimonials"); // Ganti dengan URL API Anda
        if (!response.ok) {
          throw new Error("Failed to fetch testimonials");
        }
        const data = await response.json();
        setTestimonials(data);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };

    fetchTestimonials();
    
    // Auto-slide hanya jika ada data
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
    
  }, [testimonials.length]); // Re-run effect saat data testimoni berubah

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));

  // Menambahkan kondisi agar tidak merender jika data belum ada
  if (testimonials.length === 0) {
    return null; // Atau tampilkan loading spinner
  }

  return (
    <>
      {/* Testimoni Carousel */}
      <section className="bg-white py-20 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900">
            Apa Kata Mereka?
          </h2>

          <div className="relative flex justify-center items-center gap-4">
            {/* Tombol hanya tampil jika ada lebih dari 1 testimoni */}
            {testimonials.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white shadow-lg p-3 rounded-full hover:bg-blue-600 transition-all duration-300 z-20"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 w-full mx-8 md:w-[600px] transform transition-all duration-500 ease-in-out">
              <Image
                src={testimonials[index]?.img || placeholderImage}
                alt={testimonials[index]?.name}
                width={80}
                height={80}
                className="w-20 h-20 mx-auto rounded-full object-cover mb-6 border-4 border-blue-200"
              />
              <p className="text-gray-700 italic text-lg mb-4 leading-relaxed">
                “{testimonials[index]?.text}”
              </p>
              <p className="font-bold text-blue-800 text-lg">
                {testimonials[index]?.name}
              </p>
            </div>
            
            {testimonials.length > 1 && (
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white shadow-lg p-3 rounded-full hover:bg-blue-600 transition-all duration-300 z-20"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Bagian Ulasan */}
      <section className="px-6 py-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        {isLoggedIn ? (
          <div>
            <h2 className="text-lg font-bold mb-4">Tulis Ulasan Anda</h2>
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Tulis ulasan disini..."
                className="flex-1 px-4 py-2 rounded-full text-gray-800 outline-none"
              />
              <button className="bg-green-500 px-6 py-2 rounded-full hover:bg-green-600">
                Kirim
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-lg font-bold mb-4">Ingin Beri Ulasan?</h2>
            <p className="mb-4">
              Anda harus masuk terlebih dahulu untuk memberikan ulasan.
            </p>
            <Link
              href="/login"
              className="bg-green-500 px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
            >
              Masuk Sekarang
            </Link>
          </div>
        )}
      </section>
    </>
  );
}