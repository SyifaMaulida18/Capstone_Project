"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrashIcon, PencilIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import SuperAdminLayout from "../components/superadmin_layout";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔍 state untuk search
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Data
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
        
        const response = await fetch(`${baseUrl}/jadwal-dokter`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const result = await response.json();
          setSchedules(result.data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // Delete Data
  const handleDelete = async (dokter_id, poli_id) => {
    if (window.confirm("Yakin hapus jadwal ini?")) {
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

        const response = await fetch(`${baseUrl}/jadwal-dokter/${dokter_id}/${poli_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setSchedules((prev) =>
            prev.filter((s) => !(s.dokter_id === dokter_id && s.poli_id === poli_id))
          );
          alert("Jadwal berhasil dihapus.");
        } else {
          alert("Gagal menghapus jadwal.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  // Helper: Format Tampilan Jam Kerja per Hari
  const renderScheduleTime = (item, dayPrefix) => {
    if (item[`${dayPrefix}_praktek`] !== "Y") {
      return <span className="text-red-400 text-xs font-medium">Tutup</span>;
    }

    const shifts = [];

    if (item[`${dayPrefix}_pagi_dari`] && item[`${dayPrefix}_pagi_sampai`]) {
      const start = item[`${dayPrefix}_pagi_dari`].slice(0, 5);
      const end = item[`${dayPrefix}_pagi_sampai`].slice(0, 5);
      shifts.push(`Pagi: ${start}-${end}`);
    }

    if (item[`${dayPrefix}_siang_dari`] && item[`${dayPrefix}_siang_sampai`]) {
      const start = item[`${dayPrefix}_siang_dari`].slice(0, 5);
      const end = item[`${dayPrefix}_siang_sampai`].slice(0, 5);
      shifts.push(`Siang: ${start}-${end}`);
    }

    if (item[`${dayPrefix}_sore_dari`] && item[`${dayPrefix}_sore_sampai`]) {
      const start = item[`${dayPrefix}_sore_dari`].slice(0, 5);
      const end = item[`${dayPrefix}_sore_sampai`].slice(0, 5);
      shifts.push(`Sore: ${start}-${end}`);
    }

    if (shifts.length === 0) {
      return <span className="text-orange-500 text-xs">Praktek (Jam Kosong)</span>;
    }

    return (
      <div className="flex flex-col space-y-1">
        {shifts.map((shift, idx) => (
          <span
            key={idx}
            className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] whitespace-nowrap border border-blue-100"
          >
            {shift}
          </span>
        ))}
      </div>
    );
  };

  // 🔎 Filter jadwal berdasar searchTerm
  const filteredSchedules = schedules.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (term === "") return true;

    const dokterName = item.dokter?.nama_dokter?.toLowerCase() || "";
    const poliName = item.poli?.poli_name?.toLowerCase() || "";
    const gedung = item.gedung?.toLowerCase() || "";
    const dokterId = String(item.dokter_id || "");
    const poliId = String(item.poli_id || "");

    return (
      dokterName.includes(term) ||
      poliName.includes(term) ||
      gedung.includes(term) ||
      dokterId.includes(term) ||
      poliId.includes(term)
    );
  });

  return (
    <SuperAdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-[95%] mx-auto min-h-[70vh]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-800">Manajemen Jadwal Dokter</h1>
          <div className="flex space-x-3">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Cari (dokter, poli, gedung, ID)..."
                className="w-full pl-10 pr-4 py-5 border rounded-lg focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>

            </div>
            <Link
              href="/superadmin/schedule/add"
              className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow hover:bg-secondary-600 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Tambah Jadwal</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="min-w-full divide-y divide-neutral-200 border border-neutral-200">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[150px] sticky left-0 bg-primary-600 z-10">
                  Dokter & Poli
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Gedung
                </th>
                {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => (
                  <th
                    key={day}
                    className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px] border-l border-primary-500"
                  >
                    {day}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider sticky right-0 bg-primary-600 z-10">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-neutral-500">
                    Memuat data jadwal...
                  </td>
                </tr>
              ) : filteredSchedules.length > 0 ? (
                filteredSchedules.map((item) => (
                  <tr
                    key={`${item.dokter_id}-${item.poli_id}`}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-4 sticky left-0 bg-white z-10 border-r border-neutral-100 shadow-sm">
                      <div className="font-bold text-neutral-800">
                        {item.dokter?.nama_dokter || `ID: ${item.dokter_id}`}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {item.poli?.poli_name || `Poli ID: ${item.poli_id}`}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-neutral-700 text-center font-medium">
                      {item.gedung || "-"}
                    </td>

                    <td className="px-4 py-4 border-l border-neutral-100">
                      {renderScheduleTime(item, "senin")}
                    </td>
                    <td className="px-4 py-4 border-l border-neutral-100">
                      {renderScheduleTime(item, "selasa")}
                    </td>
                    <td className="px-4 py-4 border-l border-neutral-100">
                      {renderScheduleTime(item, "rabu")}
                    </td>
                    <td className="px-4 py-4 border-l border-neutral-100">
                      {renderScheduleTime(item, "kamis")}
                    </td>
                    <td className="px-4 py-4 border-l border-neutral-100">
                      {renderScheduleTime(item, "jumat")}
                    </td>
                    <td className="px-4 py-4 border-l border-neutral-100">
                      {renderScheduleTime(item, "sabtu")}
                    </td>
                    <td className="px-4 py-4 border-l border-neutral-100">
                      {renderScheduleTime(item, "minggu")}
                    </td>

                    <td className="px-4 py-4 text-center sticky right-0 bg-white z-10 border-l border-neutral-100 shadow-sm">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleDelete(item.dokter_id, item.poli_id)}
                          className="text-neutral-400 hover:text-red-600 p-1 rounded transition-colors"
                          title="Hapus Jadwal"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <Link
                          href={`/superadmin/schedule/edit/${item.dokter_id}/${item.poli_id}`}
                          className="text-neutral-400 hover:text-primary-600 p-1 rounded transition-colors"
                          title="Edit Jadwal"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-neutral-400 italic">
                    Tidak ada jadwal dokter yang cocok dengan pencarian / belum ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
