import {
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "@/app/admin/components/admin_layout"; // Path AdminLayout

// Data dummy untuk tabel (sesuaikan jika perlu)
const users = [
  { id: 1, nama: "Saputra", email: "saputra123@gmail.com", telp: "081254345678" },
  { id: 2, nama: "Muhammad Ole", email: "oleganz123@gmail.com", telp: "0822123212321" },
];

export default function UserManagementPage() { // Nama fungsi sudah sesuai
  return (
    <AdminLayout>
      {/* Kontainer Utama */}
      {/* UBAH: Menggunakan border-primary-200 */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        {/* UBAH: Menggunakan text-neutral-800 */}
        <h1 className="text-2xl font-bold text-center mb-8 text-neutral-800">
          Manajemen User
        </h1>

        {/* Header Filter, Search, dan Add Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3 ml-auto">
            {/* Search Box */}
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search..."
                /* UBAH: Menggunakan neutral dan primary */
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {/* UBAH: Menggunakan text-neutral-600 */}
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
            </div>

            {/* Filter Button */}
            {/* UBAH: Menggunakan neutral */}
            <button className="flex items-center space-x-2 bg-white text-neutral-700 border border-neutral-200 px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-100 transition-colors font-semibold">
              <FunnelIcon className="h-5 w-5 text-neutral-600" />
              <span>Filter</span>
            </button>

            {/* Add Button */}
            {/* UBAH: Menggunakan secondary */}
            <button className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold">
              <PlusIcon className="h-5 w-5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Tabel Data User */}
        <div className="overflow-x-auto">
          {/* UBAH: Menggunakan divide-neutral-200 */}
          <table className="min-w-full divide-y divide-neutral-200">
            {/* UBAH: Menggunakan bg-primary-600 */}
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                {["Id", "Nama", "Email", "No Telp", "Aksi"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider rounded-t-lg first:rounded-tl-lg last:rounded-tr-lg"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            {/* UBAH: Menggunakan divide-neutral-100 */}
            <tbody className="bg-white divide-y divide-neutral-100">
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  /* UBAH: Menggunakan bg-neutral-50 */
                  className={index % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                >
                  {/* UBAH: Menggunakan text-neutral-900 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {user.id}
                  </td>
                  {/* UBAH: Menggunakan text-neutral-800 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                    {user.nama}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                    {user.telp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {/* Tombol Hapus */}
                      {/* UBAH: Menggunakan neutral, red */}
                      <button className="text-neutral-600 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      {/* Tombol Edit */}
                      {/* UBAH: Menggunakan neutral, primary */}
                      <button className="text-neutral-600 hover:text-primary-600 transition-colors p-1 rounded-md hover:bg-primary-50">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}