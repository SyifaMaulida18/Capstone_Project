import { Button } from "../components/ui/button";

export default function DoctorScheduleTable({ data, onDelete }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-blue-100 text-blue-700 font-semibold">
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
              <td colSpan={6} className="text-center p-6 text-gray-500">
                Belum ada jadwal dokter
              </td>
            </tr>
          ) : (
            data.map((s, i) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{s.id}</td>
                <td className="p-3">{s.doctorName}</td>
                <td className="p-3">{s.specialization}</td>
                <td className="p-3">{s.day}</td>
                <td className="p-3">
                  {s.startTime} - {s.endTime}
                </td>
                <td className="p-3 text-right space-x-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(i)}
                  >
                    🗑
                  </Button>
                  <Button variant="outline" size="sm">
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
