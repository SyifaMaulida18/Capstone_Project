"use client";

import { useState, useEffect } from "react"; // Impor useState dan useEffect
import {
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "@/app/admin/components/admin_layout";
import { Dialog } from "@/app/admin/components/ui/dialog"; // Asumsi path Dialog benar
import { Input } from "@/app/admin/components/ui/input"; // Asumsi path Input benar

// --- DATA SIMULASI ---
// (Di aplikasi nyata, Anda akan fetch data ini)

const initialQueues = [
  {
    id: 1,
    pasienId: 1, // Merujuk ke Ayu Gideon
    dokterId: 1, // Merujuk ke Dr. Budi Santoso
    namaPasien: "Ayu dan Gideon",
    dokter: "Dr. Budi Santoso",
    waktu: "08:30",
    status: "Menunggu",
  },
  {
    id: 2,
    pasienId: 2, // Merujuk ke Syifa
    dokterId: 2, // Merujuk ke Dr. Andi
    namaPasien: "Syifa maulida",
    dokter: "Dr. Andi Rahman",
    waktu: "09:00",
    status: "Dalam Pemeriksaan",
  },
  {
    id: 3,
    pasienId: 3, // Merujuk ke Sheva
    dokterId: 3, // Merujuk ke Dr. Rina
    namaPasien: "Sheva Rebecca",
    dokter: "Dr. Rina Kartika",
    waktu: "09:45",
    status: "Selesai",
  },
];

// Data master untuk dropdown
const registeredPatients = [
  { id: 1, nama: "Ayu Gideon" },
  { id: 2, nama: "Syifa maulida" },
  { id: 3, nama: "Sheva Rebecca" },
  { id: 4, nama: "Saputra" },
  { id: 5, nama: "Muhammad Ole" },
];

const registeredDoctors = [
  { id: 1, nama: "Dr. Budi Santoso" },
  { id: 2, nama: "Dr. Andi Rahman" },
  { id: 3, nama: "Dr. Rina Kartika" },
  { id: 4, nama: "Dr. Lisa Hermawan" },
];

const statusOptions = ["Menunggu", "Dalam Pemeriksaan", "Selesai"];

// --- KOMPONEN UTAMA ---

export default function QueueManagementPage() {
  const [queues, setQueues] = useState(initialQueues);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState(null); // null = Add, Object = Edit

  // State untuk form di dalam dialog
  const [formData, setFormData] = useState({
    pasienId: "",
    dokterId: "",
    waktu: "",
    status: "Menunggu", // Default status
  });

  // useEffect untuk mengisi form saat dialog dibuka
  useEffect(() => {
    if (isDialogOpen) {
      if (editingQueue) {
        // Mode Edit
        setFormData({
          pasienId: editingQueue.pasienId.toString(),
          dokterId: editingQueue.dokterId.toString(),
          waktu: editingQueue.waktu,
          status: editingQueue.status,
        });
      } else {
        // Mode Add
        setFormData({
          pasienId: registeredPatients[0]?.id.toString() || "",
          dokterId: registeredDoctors[0]?.id.toString() || "",
          waktu: "",
          status: "Menunggu",
        });
      }
    }
  }, [isDialogOpen, editingQueue]);

  // --- HANDLERS ---

  const handleOpenAddDialog = () => {
    setEditingQueue(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (queue) => {
    setEditingQueue(queue);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingQueue(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus antrian ini?")) {
      setQueues(queues.filter((q) => q.id !== id));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ambil data nama dari master data berdasarkan ID
    const selectedPatient = registeredPatients.find(
      (p) => p.id.toString() === formData.pasienId
    );
    const selectedDoctor = registeredDoctors.find(
      (d) => d.id.toString() === formData.dokterId
    );

    if (!selectedPatient || !selectedDoctor) {
      alert("Pasien atau Dokter tidak valid.");
      return;
    }

    const queueData = {
      ...formData,
      pasienId: parseInt(formData.pasienId, 10),
      dokterId: parseInt(formData.dokterId, 10),
      namaPasien: selectedPatient.nama,
      dokter: selectedDoctor.nama,
    };

    if (editingQueue) {
      // --- Logika UPDATE ---
      setQueues(
        queues.map((q) =>
          q.id === editingQueue.id
            ? { ...q, ...queueData, id: q.id } // Pastikan ID tetap
            : q
        )
      );
    } else {
      // --- Logika ADD ---
      setQueues([
        ...queues,
        { ...queueData, id: (queues.length + 1) * 100 }, // ID unik dummy
      ]);
    }

    handleCloseDialog();
  };

  // --- Filtering Data ---
  const filteredQueues = queues.filter(
    (q) =>
      q.namaPasien.toLowerCase().includes(search.toLowerCase()) ||
      q.dokter.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-8 text-neutral-800">
          Manajemen Antrian
        </h1>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3 ml-auto">
            {/* Search Box */}
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Cari pasien, dokter..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
            </div>

            {/* Filter Button */}
            <button className="flex items-center space-x-2 bg-white text-neutral-700 border border-neutral-200 px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-100 transition-colors font-semibold">
              <FunnelIcon className="h-5 w-5 text-neutral-600" />
              <span>Filter</span>
            </button>

            {/* Add Button */}
            <button
              onClick={handleOpenAddDialog} // --- UBAH DI SINI ---
              className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Tabel Data Antrian */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                {[
                  "ID",
                  "Nama Pasien",
                  "Dokter",
                  "Waktu",
                  "Status",
                  "Aksi",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider rounded-t-lg first:rounded-tl-lg last:rounded-tr-lg"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {filteredQueues.map((queue, index) => (
                <tr
                  key={queue.id}
                  className={index % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {queue.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                    {queue.namaPasien}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                    {queue.dokter}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                    {queue.waktu}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      queue.status === "Menunggu"
                        ? "text-yellow-600"
                        : queue.status === "Dalam Pemeriksaan"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {queue.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDelete(queue.id)} // --- UBAH DI SINI ---
                        className="text-neutral-600 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditDialog(queue)} // --- UBAH DI SINI ---
                        className="text-neutral-600 hover:text-primary-600 transition-colors p-1 rounded-md hover:bg-primary-50"
                      >
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

      {/* --- DIALOG UNTUK ADD DAN EDIT --- */}
      <Dialog show={isDialogOpen} onClose={handleCloseDialog}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-neutral-700 mb-2">
            {editingQueue ? "Edit Antrian" : "Tambah Antrian Baru"}
          </h2>

          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Nama Pasien
            </label>
            <select
              name="pasienId"
              value={formData.pasienId}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {registeredPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Dokter
            </label>
            <select
              name="dokterId"
              value={formData.dokterId}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {registeredDoctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Waktu
            </label>
            <Input
              type="time"
              name="waktu"
              value={formData.waktu}
              onChange={handleFormChange}
              required
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseDialog}
              className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-secondary-500 text-white px-4 py-2 rounded-lg hover:bg-secondary-600 transition"
            >
              Simpan
            </button>
          </div>
        </form>
      </Dialog>
    </AdminLayout>
  );
}