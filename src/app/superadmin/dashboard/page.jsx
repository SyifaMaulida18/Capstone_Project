import TopNav from "../components/top_navbar";
import Header from "../components/header";
import Card from "../../admin/components/card"; // Reuse komponen Card dari admin

export default function HomeSuperAdminPage() {
  return (
    // Styling dijaga tetap konsisten
    <main className="bg-neutral-100 min-h-screen">
      <Header />
      <TopNav />

      {/* Konten Utama Dashboard */}
      <div className="p-8">
        {/* --- UBAH: Teks sapaan --- */}
        <h1 className="text-3xl font-bold mt-8 text-neutral-900">
          Selamat datang, Super Admin
        </h1>

        {/* Ringkasan Data Pasien */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">
            Ringkasan Data Pasien
          </h2>
          <div className="h-40 bg-neutral-200 rounded-lg"></div>
          {/* Placeholder untuk chart/data */}
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Card title="Jumlah Reservasi Hari Ini" content="75" />
          <Card title="Jumlah Dokter Aktif Hari Ini" content="12" />
          {/* Anda bisa menambahkan data spesifik superadmin di sini */}
          <Card title="Jumlah Admin Terdaftar" content="4" />
        </div>

        {/* Detail Pasien Hari Ini (Sama seperti admin) */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">
            Detail Pasien Hari Ini
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-primary-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Poli
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Jumlah Pasien
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Dokter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {/* Contoh Data */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    05 September 2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    Poli Umum
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    50
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    dr. Sopo
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    Ramai
                  </td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    05 September 2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    Poli Anak
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    26
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    dr. Angger
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    Normal
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}