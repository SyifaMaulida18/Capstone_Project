"use client";
import AdminLayout from "@/app/superadmin/components/superadmin_layou"; // Path AdminLayout
import { Dialog } from "@/app/superadmin/components/ui/dialog"; // Path Dialog
import { Input } from "@/app/superadmin/components/ui/input"; // Path Input
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react"; // Impor useEffect

// --- DATA SIMULASI ---

// Data dummy dokter yang terdaftar (untuk <select>)
// Di aplikasi nyata, ini akan di-fetch dari API
const registeredDoctors = [
  { id: 1, nama: "Dr. Budi Santoso", spesialis: "Kardiologi" },
  { id: 2, nama: "Dr. Lisa Hermawan", spesialis: "Anestesi" },
  { id: 3, nama: "Saputra", spesialis: "Jantung" }, // Dari data dummy Anda sebelumnya
  { id: 4, nama: "Muhammad Ole", spesialis: "Organ Dalam" }, // Dari data dummy Anda sebelumnya
];

// Data dummy jadwal (Saya tambahkan doctorId agar relasinya jelas)
const dataJadwal = [
  {
    id: 1,
    doctorId: 1, // ID merujuk ke Dr. Budi Santoso
    doctorName: "Dr. Budi Santoso",
    specialization: "Kardiologi",
    day: "Senin",
    startTime: "08:00",
    endTime: "12:00",
  },
  {
    id: 2,
    doctorId: 2, // ID merujuk ke Dr. Lisa Hermawan
    doctorName: "Dr. Lisa Hermawan",
    specialization: "Anestesi",
    day: "Rabu",
    startTime: "10:00",
    endTime: "15:00",
  },
];

// Opsi untuk <select> hari
const daysOptions = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

// --- KOMPONEN UTAMA ---

export default function DoctorSchedulePage() {
  const [search, setSearch] = useState("");
  const [schedules, setSchedules] = useState(dataJadwal);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null); // null = Add, Object = Edit

  // State untuk form di dalam dialog
  const [formData, setFormData] = useState({
    doctorId: "", // Kita simpan ID-nya
    day: "Senin", // Default hari Senin
    startTime: "",
    endTime: "",
  });

  // useEffect untuk mengisi form saat dialog dibuka
  useEffect(() => {
    if (isDialogOpen) {
      if (editingSchedule) {
        // Mode Edit: Isi form dengan data yang ada
        setFormData({
          doctorId: editingSchedule.doctorId.toString(),
          day: editingSchedule.day,
          startTime: editingSchedule.startTime,
          endTime: editingSchedule.endTime,
        });
      } else {
        // Mode Add: Reset form
        setFormData({
          doctorId: registeredDoctors[0]?.id.toString() || "", // Default ke dokter pertama
          day: "Senin",
          startTime: "",
          endTime: "",
        });
      }
    }
  }, [isDialogOpen, editingSchedule]);

  // Handler untuk membuka dialog (mode Add)
  const handleOpenAddDialog = () => {
    setEditingSchedule(null);
    setIsDialogOpen(true);
  };

  // Handler untuk membuka dialog (mode Edit)
  const handleOpenEditDialog = (schedule) => {
    setEditingSchedule(schedule);
    setIsDialogOpen(true);
  };

  // Handler untuk menutup dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSchedule(null); // Selalu reset
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus jadwal ini?")) {
      setSchedules(schedules.filter((d) => d.id !== id));
    }
  };

  // Handler untuk perubahan field di form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler untuk submit form (Add & Edit)
  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedDoctor = registeredDoctors.find(
      (d) => d.id.toString() === formData.doctorId
    );
    if (!selectedDoctor) return; // Validasi jika dokter tidak ditemukan

    const scheduleData = {
      ...formData,
      doctorName: selectedDoctor.nama,
      specialization: selectedDoctor.spesialis,
      doctorId: parseInt(formData.doctorId, 10),
    };

    if (editingSchedule) {
      // --- Logika UPDATE ---
      setSchedules(
        schedules.map((s) =>
          s.id === editingSchedule.id
            ? { ...s, ...scheduleData, id: s.id } // Pastikan ID tetap
            : s
        )
      );
    } else {
      // --- Logika ADD ---
      setSchedules([
        ...schedules,
        { ...scheduleData, id: (schedules.length + 1) * 100 }, // ID unik dummy
      ]);
    }

    handleCloseDialog(); // Tutup dialog setelah submit
  };

  // --- Filtering Data ---
  const filteredData = schedules.filter(
    (s) =>
      s.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      s.specialization.toLowerCase().includes(search.toLowerCase()) ||
      s.day.toLowerCase().includes(search.toLowerCase())
  );

  // Cari data dokter yang dipilih di form untuk auto-fill spesialisasi
  const selectedDoctorInForm = registeredDoctors.find(
    (d) => d.id.toString() === formData.doctorId
  );

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-8 text-neutral-800">
          Manajemen Jadwal Dokter
        </h1>

        {/* Header Filter, Search, dan Add Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3 ml-auto">
            {/* Search Box */}
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Cari dokter, spesialis, hari..."
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
              className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold"
              onClick={handleOpenAddDialog} // --- UBAH DI SINI ---
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                {[
                  "ID",
                  "Nama Dokter",
                  "Spesialisasi",
                  "Hari",
                  "Jam",
                  "Aksi",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider first:rounded-tl-lg last:rounded-tr-lg"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {filteredData.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                >
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {item.doctorName}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {item.specialization}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {item.day}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {item.startTime} - {item.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        className="text-neutral-600 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-neutral-600 hover:text-primary-600 transition-colors p-1 rounded-md hover:bg-primary-50"
                        onClick={() => handleOpenEditDialog(item)} // --- UBAH DI SINI ---
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-neutral-600 italic"
                  >
                    Tidak ada jadwal ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DIALOG UNTUK ADD DAN EDIT --- */}
      <Dialog show={isDialogOpen} onClose={handleCloseDialog}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-neutral-700 mb-2">
            {/* Judul dinamis */}
            {editingSchedule ? "Edit Jadwal Dokter" : "Tambah Jadwal Dokter"}
          </h2>

          {/* === PERUBAHAN PENTING DI SINI === */}
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Nama Dokter
            </label>
            {/* Menggunakan <select> */}
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="" disabled>
                -- Pilih Dokter --
              </option>
              {registeredDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Spesialisasi
            </label>
            {/* Input read-only, nilai diambil dari dokter yang dipilih */}
            <Input
              value={selectedDoctorInForm?.spesialis || ""}
              readOnly
              disabled
              className="bg-neutral-100"
            />
          </div>
          {/* === BATAS PERUBAHAN PENTING === */}

          <div>
            <label className="text-sm text-neutral-600 block mb-1">Hari</label>
            {/* Menggunakan <select> untuk Hari */}
            <select
              name="day"
              value={formData.day}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {daysOptions.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-neutral-600 block mb-1">
                Mulai
              </label>
              <Input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-neutral-600 block mb-1">
                Selesai
              </label>
              <Input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleFormChange}
                required
              />
            </div>
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