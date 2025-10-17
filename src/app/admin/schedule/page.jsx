"use client";

import { useState } from "react";
import {
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "@/app/admin/components/admin_layout";
import { Dialog } from "@/app/admin/components/ui/dialog";
import { Input } from "@/app/admin/components/ui/input";

export default function DoctorSchedulePage() {
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [data, setData] = useState([
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
  ]);

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

    const newSchedule = {
      id: data.length + 1,
      ...form,
    };

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

  const filteredData = data.filter(
    (s) =>
      s.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      s.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-400 max-w-6xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>

            {/* Filter Button */}
            <button className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition-colors font-semibold">
              <FunnelIcon className="h-5 w-5 text-gray-600" />
              <span>Filter</span>
            </button>

            {/* Add Button */}
            <button
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors font-semibold"
              onClick={() => setShowDialog(true)}
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-400 rounded-t-lg">
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
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredData.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 1 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {item.doctorName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {item.specialization}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {item.day}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {item.startTime} - {item.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {/* Tombol Hapus */}
                      <button
                        className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                      >
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

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-500 italic"
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
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Tambah Jadwal Dokter
          </h2>

          <div>
            <label className="text-sm text-gray-600">Nama Dokter</label>
            <Input
              value={form.doctorName}
              onChange={(e) =>
                setForm({ ...form, doctorName: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Spesialisasi</label>
            <Input
              value={form.specialization}
              onChange={(e) =>
                setForm({ ...form, specialization: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Hari</label>
            <Input
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-600">Mulai</label>
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
              <label className="text-sm text-gray-600">Selesai</label>
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
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Simpan
            </button>
          </div>
        </form>
      </Dialog>
    </AdminLayout>
  );
}
