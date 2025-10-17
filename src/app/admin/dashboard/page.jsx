// src/app/dashboardadmin/page.jsx
import TopNav from '@/app/admin/components/top_navbar';
import Header from '@/app/admin/components/header';
import Card from '@/app/admin/components/card';

export default function HomeAdminPage() {
  return (
    <main className="bg-gray-100 min-h-screen">
      {/* Header Biru di atas */}
      <Header />

      {/* Navigasi Horizontal di bawah header */}
      <TopNav />

      {/* Konten Utama Dashboard */}
      <div className="p-8">
        <h1 className="text-3xl font-bold mt-8">Selamat datang, Admin</h1>

        {/* Ringkasan Data Pasien */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4">Ringkasan Data Pasien</h2>
          <div className="h-40 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Card title="Jumlah Reservasi Hari Ini" />
          <Card title="Jumlah Dokter Aktif Hari Ini" />
        </div>

        {/* Detail Pasien Hari Ini */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4">Detail Pasien Hari Ini</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Poli</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Jumlah Pasien</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Dokter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Keterangan</th>
                </tr>
              </thead>
              <tbody className="bg-blue-100 divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">05 September 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Poli Umum</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">50</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">dr. Sopo</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ramai</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">05 September 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Poli Anak</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">26</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">dr. Angger</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Normal</td>
                </tr>
                 <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">05 September 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Poli Mata</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">dr. Ayu</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Normal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}