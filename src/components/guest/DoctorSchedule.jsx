import { User, Clock } from 'lucide-react';

// Card individual untuk setiap jadwal
const ScheduleCard = ({ poly, doctor, time, quota }) => {
    const isAvailable = quota > 0;
    return (
        // UBAH: Menggunakan border 'primary-500'
        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-t border-primary-500 transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center mb-3">
                {/* UBAH: Menggunakan 'text-primary-800' untuk judul poli */}
                <h3 className="text-xl font-bold text-primary-800">{poly}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    isAvailable 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                    {isAvailable ? `${quota} Kuota` : 'Penuh'}
                </span>
            </div>
            
            {/* UBAH: Menggunakan 'text-neutral-700' untuk teks utama */}
            <p className="flex items-center text-neutral-700 font-medium mb-2">
                {/* UBAH: Menggunakan 'text-primary-500' untuk ikon */}
                <User className="w-4 h-4 mr-2 text-primary-500" />
                {doctor}
            </p>
            {/* UBAH: Menggunakan 'text-neutral-600' untuk teks sekunder */}
            <p className="flex items-center text-neutral-600 text-sm">
                {/* UBAH: Menggunakan 'text-primary-500' untuk ikon */}
                <Clock className="w-4 h-4 mr-2 text-primary-500" />
                {time}
            </p>
        </div>
    );
};

// Section utama yang menampilkan semua jadwal
export default function DoctorScheduleSection() {
    const schedules = [
        { poly: "Poli Jantung", doctor: "Dr. Iqbal Sp.JP", time: "08:00 - 12:00", quota: 5 },
        { poly: "Poli Anak", doctor: "Dr. Leda Sp.A", time: "14:00 - 17:00", quota: 12 },
        { poly: "Poli Penyakit Dalam", doctor: "Dr. Kore Sp.PD", time: "09:00 - 13:00", quota: 0 },
        { poly: "Poli Gigi", doctor: "Dr. Fenrir Sp.KG", time: "10:00 - 14:00", quota: 8 },
    ];

    return (
        <section id="jadwal-dokter" className="px-6 py-16 max-w-6xl mx-auto scroll-mt-28">
            {/* UBAH: Menggunakan 'text-neutral-900' untuk judul section */}
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900">
                Cek Jadwal Poli & Dokter Hari Ini
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {schedules.map((s, idx) => (
                    <ScheduleCard key={idx} {...s} />
                ))}
            </div>
            <div className="text-center mt-12">
                <a
                    href="/login"
                    // UBAH: Menggunakan 'primary-500' dan 'primary-600' (bukan 600/700)
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary-500 hover:bg-primary-600 md:py-4 md:text-lg md:px-10 shadow-lg transition-colors"
                >
                    Login untuk Melakukan Reservasi
                </a>
            </div>
        </section>
    );
}