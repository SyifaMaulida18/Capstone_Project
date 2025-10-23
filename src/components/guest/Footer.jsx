// Komponen Footer yang bisa dipakai di banyak halaman

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white px-6 py-16 grid md:grid-cols-4 gap-8">
            <div className="col-span-full md:col-span-1">
                <h3 className="text-2xl font-bold mb-4 text-blue-400">Reservasi Medis</h3>
                <p className="text-sm text-gray-400">
                    Sistem Reservasi Online digunakan untuk pendaftaran rawat jalan. Untuk keadaan darurat, segera hubungi UGD terdekat.
                </p>
            </div>
            <div>
                <h3 className="font-bold mb-4 text-gray-200">Navigasi</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="/" className="hover:text-blue-400 transition-colors">Beranda</a></li>
                    <li><a href="/about" className="hover:text-blue-400 transition-colors">Tentang Kami</a></li>
                    <li><a href="/reservasi" className="hover:text-blue-400 transition-colors">Mulai Reservasi</a></li>
                </ul>
            </div>
            <div>
                <h3 className="font-bold mb-4 text-gray-200">Dukungan</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="/faq" className="hover:text-blue-400 transition-colors">FAQ</a></li>
                    <li><a href="/chat-admin" className="hover:text-blue-400 transition-colors">Chat dengan Admin</a></li>
                </ul>
            </div>
            <div>
                <h3 className="font-bold mb-4 text-gray-200">Kontak Kami</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li><span className="font-semibold text-gray-300">Telepon:</span> (1234) 678910</li>
                    <li><span className="font-semibold text-gray-300">Email:</span> info@rsbp.com</li>
                </ul>
            </div>
            <div className="col-span-full border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
                © 2024 Reservasi Medis. Semua Hak Cipta Dilindungi.
            </div>
        </footer>
    );
}
