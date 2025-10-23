import { User, Clock } from 'lucide-react';

// Card individual untuk setiap jadwal
const ScheduleCard = ({ poly, doctor, time, quota }) => {
    const isAvailable = quota > 0;
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-t border-blue-500 transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-blue-800">{poly}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isAvailable ? `${quota} Kuota` : 'Penuh'}
                </span>
            </div>
            
            <p className="flex items-center text-gray-700 font-medium mb-2">
                <User className="w-4 h-4 mr-2 text-blue-500" />
                {doctor}
            </p>
            <p className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
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
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-lg transition-colors"
                >
                    Login untuk Melakukan Reservasi
                </a>
            </div>
        </section>
    );
}
