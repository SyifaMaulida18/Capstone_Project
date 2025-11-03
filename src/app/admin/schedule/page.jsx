"use client";
import AdminLayout from "@/app/admin/components/admin_layout"; // Path AdminLayout
import { Dialog } from "@/app/admin/components/ui/dialog"; // Path Dialog (INI YANG DIPAKAI)
import { Input } from "@/app/admin/components/ui/input"; // Path Input (Asumsi benar)
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

// Data dummy jadwal dokter
const dataJadwal = [
  {
    id: 1,
    doctorName: "Dr. Budi Santoso",
    specialization: "Kardiologi",
    day: "Senin",
    startTime: "08:00",
    endTime: "12:00",
  },
  {
    id: 2,
    doctorName: "Dr. Lisa Hermawan",
    specialization: "Anestesi",
    day: "Rabu",
    startTime: "10:00",
    endTime: "15:00",
  },
];

export default function DoctorSchedulePage() {
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [data, setData] = useState(dataJadwal); // Initialize with dummy data

  const [form, setForm] = useState({
    doctorName: "",
    specialization: "",
    day: "",
    startTime: "",
    endTime: "",
  });

  const handleDelete = (id) => {
    setData(data.filter((d) => d.id !== id));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.doctorName || !form.specialization || !form.day) return;
    const newSchedule = { id: data.length + 1, ...form };
    setData([...data, newSchedule]);
    setShowDialog(false);
    setForm({
      doctorName: "",
      specialization: "",
      day: "",
      startTime: "",
      endTime: "",
    });
  };

   const handleEdit = (jadwal) => {
    // Logika untuk mengisi form edit dan membuka dialog edit
    // setEditingSchedule(jadwal);
    // setShowEditDialog(true); // Anda perlu membuat state dan dialog edit terpisah
    console.log("Edit schedule:", jadwal);
  };


  const filteredData = data.filter(
    (s) =>
      s.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      s.specialization.toLowerCase().includes(search.toLowerCase())
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
                placeholder="Search..."
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
              onClick={() => setShowDialog(true)}
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
                        onClick={() => handleEdit(item)} // Panggil handleEdit saat tombol edit ditekan
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

      {/* Dialog Tambah Jadwal Dokter */}
      <Dialog show={showDialog} onClose={() => setShowDialog(false)}>
        <form onSubmit={handleAdd} className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-neutral-700 mb-2">
            Tambah Jadwal Dokter
          </h2>

          <div>
            <label className="text-sm text-neutral-600">Nama Dokter</label>
            <Input
              value={form.doctorName}
              onChange={(e) =>
                setForm({ ...form, doctorName: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Spesialisasi</label>
            <Input
              value={form.specialization}
              onChange={(e) =>
                setForm({ ...form, specialization: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Hari</label>
            <Input
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-neutral-600">Mulai</label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-neutral-600">Selesai</label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm({ ...form, endTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowDialog(false)}
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