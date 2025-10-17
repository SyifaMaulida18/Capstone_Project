import { TrashIcon, PencilIcon, MagnifyingGlassIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';
import AdminLayout from '@/app/admin/components/admin_layout';

// Data dummy untuk tabel
const users = [
  { id: 1, nama: 'Saputra', email: 'saputra123@gmail.com', telp: '081254345678' },
  { id: 2, nama: 'Muhammad Ole', email: 'oleganz123@gmail.com', telp: '0822123212321' },
];

export default function UserManagementPage() {
  return (
    <AdminLayout>
      {/* Kontainer Utama yang berfungsi sebagai kartu besar bergaris biru */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-400 max-w-6xl mx-auto min-h-[70vh]">
        
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">Manajemen User</h1>

        {/* Header Filter, Search, dan Add Button */}
        <div className="flex justify-between items-center mb-8">
          
          {/* Pencarian dan Filter di sebelah kanan */}
          <div className="flex items-center space-x-3 ml-auto">
            
            {/* Search Box */}
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {/* Filter Button */}
            <button className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition-colors font-semibold">
              <FunnelIcon className="h-5 w-5 text-gray-600" />
              <span>Filter</span>
            </button>

            {/* Add Button */}
            <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors font-semibold">
              <PlusIcon className="h-5 w-5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Tabel Data User */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-400 rounded-t-lg">
              <tr>
                {['Id', 'Nama', 'Email', 'No Telp', 'Aksi'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider rounded-t-lg first:rounded-tl-lg last:rounded-tr-lg"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user, index) => (
                <tr key={user.id} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.telp}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {/* Tombol Hapus */}
                      <button className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      {/* Tombol Edit */}
                      <button className="text-gray-500 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50">
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
