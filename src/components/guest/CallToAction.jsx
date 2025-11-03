// Komponen untuk section biru di atas footer

export default function CallToAction() {
  return (
    // UBAH: Menggunakan gradasi 'primary' (indigo) dari config Anda
    <section className="px-6 py-12 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
      <div className="text-center">
        <h2 className="text-lg font-bold mb-4">
          Ingin Buat Reservasi atau Beri Ulasan?
        </h2>
        <p className="mb-4">
          Daftar atau masuk sekarang untuk menikmati semua fitur layanan.
        </p>
        <a
          href="/auth/login"
          // UBAH: Menggunakan 'secondary' (hijau) dari config Anda
          className="bg-secondary-500 px-6 py-2 rounded-full font-semibold hover:bg-secondary-600 transition-colors shadow-md"
        >
          Masuk Sekarang
        </a>
      </div>
    </section>
  );
}