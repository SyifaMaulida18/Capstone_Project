// Komponen untuk section biru di atas footer

export default function CallToAction() {
    return (
        <section className="px-6 py-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="text-center">
                <h2 className="text-lg font-bold mb-4">Ingin Buat Reservasi atau Beri Ulasan?</h2>
                <p className="mb-4">
                    Daftar atau masuk sekarang untuk menikmati semua fitur layanan.
                </p>
                <a
                    href="/login"
                    className="bg-green-500 px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-md"
                >
                    Masuk Sekarang
                </a>
            </div>
        </section>
    );
}
