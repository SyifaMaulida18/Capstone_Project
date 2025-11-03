import { Button } from "../components/ui/button"; // Asumsi path Button benar

export default function DoctorScheduleTable({ data, onDelete }) {
  return (
    // UBAH: Menggunakan border-neutral-200
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        {/* UBAH: Menggunakan bg-primary-100 dan text-primary-800 */}
        <thead className="bg-primary-100 text-primary-800 font-semibold">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Nama Dokter</th>
            <th className="p-3 text-left">Spesialisasi</th>
            <th className="p-3 text-left">Hari</th>
            <th className="p-3 text-left">Jam</th>
            <th className="p-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              {/* UBAH: Menggunakan text-neutral-600 */}
              <td colSpan={6} className="text-center p-6 text-neutral-600">
                Belum ada jadwal dokter
              </td>
            </tr>
          ) : (
            data.map((s, i) => (
              // UBAH: Menggunakan border-neutral-100 dan hover:bg-neutral-50
              <tr
                key={s.id}
                className="border-t border-neutral-100 hover:bg-neutral-50"
              >
                {/* UBAH: Menggunakan text-neutral-900 atau text-neutral-700 */}
                <td className="p-3 text-neutral-700">{s.id}</td>
                <td className="p-3 text-neutral-700">{s.doctorName}</td>
                <td className="p-3 text-neutral-700">{s.specialization}</td>
                <td className="p-3 text-neutral-700">{s.day}</td>
                <td className="p-3 text-neutral-700">
                  {s.startTime} - {s.endTime}
                </td>
                <td className="p-3 text-right space-x-2">
                  <Button
                    variant="destructive" // Warna merah dipertahankan
                    size="sm"
                    onClick={() => onDelete(i)}
                  >
                    🗑
                  </Button>
                  {/* UBAH: Sesuaikan variant Button jika perlu agar cocok dengan tema */}
                  <Button variant="outline" size="sm"> {/* Asumsi 'outline' menggunakan warna netral */}
                    ✏️
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}