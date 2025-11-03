// Komponen Footer yang bisa dipakai di banyak halaman

export default function Footer() {
  return (
    // UBAH: Menggunakan 'neutral-900' untuk background
    <footer className="bg-neutral-900 text-white px-6 py-16 grid md:grid-cols-4 gap-8">
      <div className="col-span-full md:col-span-1">
        {/* UBAH: Menggunakan 'primary-500' sebagai warna aksen brand */}
        <h3 className="text-2xl font-bold mb-4 text-primary-500">
          Reservasi Medis
        </h3>
        {/* UBAH: Menggunakan 'neutral-200' untuk teks terang (light) */}
        <p className="text-sm text-neutral-200">
          Sistem Reservasi Online digunakan untuk pendaftaran rawat jalan. Untuk
          keadaan darurat, segera hubungi UGD terdekat.
        </p>
      </div>
      <div>
        {/* UBAH: Menggunakan 'neutral-200' untuk judul */}
        <h3 className="font-bold mb-4 text-neutral-200">Navigasi</h3>
        {/* UBAH: Menggunakan 'neutral-200' dan 'hover:text-primary-500' */}
        <ul className="space-y-2 text-sm text-neutral-200">
          <li>
            <a href="/" className="hover:text-primary-500 transition-colors">
              Beranda
            </a>
          </li>
          <li>
            <a
              href="/about"
              className="hover:text-primary-500 transition-colors"
            >
              Tentang Kami
            </a>
          </li>
          <li>
            <a
              href="/reservasi"
              className="hover:text-primary-500 transition-colors"
            >
              Mulai Reservasi
            </a>
          </li>
        </ul>
      </div>
      <div>
        {/* UBAH: Menggunakan 'neutral-200' */}
        <h3 className="font-bold mb-4 text-neutral-200">Dukungan</h3>
        {/* UBAH: Menggunakan 'neutral-200' dan 'hover:text-primary-500' */}
        <ul className="space-y-2 text-sm text-neutral-200">
          <li>
            <a href="/faq" className="hover:text-primary-500 transition-colors">
              FAQ
            </a>
          </li>
          <li>
            <a
              href="/chat-admin"
              className="hover:text-primary-500 transition-colors"
            >
              Chat dengan Admin
            </a>
          </li>
        </ul>
      </div>
      <div>
        {/* UBAH: Menggunakan 'neutral-200' */}
        <h3 className="font-bold mb-4 text-neutral-200">Kontak Kami</h3>
        {/* UBAH: Menggunakan 'neutral-200' */}
        <ul className="space-y-2 text-sm text-neutral-200">
          <li>
            <span className="font-semibold text-neutral-200">Telepon:</span>{" "}
            (1234) 678910
          </li>
          <li>
            <span className="font-semibold text-neutral-200">Email:</span>{" "}
            info@rsbp.com
          </li>
        </ul>
      </div>
      {/* UBAH: Menggunakan 'neutral-700' dan 'neutral-600' */}
      <div className="col-span-full border-t border-neutral-700 mt-8 pt-8 text-center text-sm text-neutral-600">
        © 2024 Reservasi Medis. Semua Hak Cipta Dilindungi.
      </div>
    </footer>
  );
}