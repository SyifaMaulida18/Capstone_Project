"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PencilIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import AdminLayout from "../components/admin_layout";

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔍 state untuk search
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Data
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

        const response = await fetch(`${baseUrl}/jadwal-dokter`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const result = await response.json();
          setSchedules(result.data || []);
        } else {
          console.error("Gagal mengambil jadwal dokter");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // Helper: Format Jam Kerja
  const renderScheduleTime = (item, dayPrefix) => {
    if (item[`${dayPrefix}_praktek`] !== "Y") {
      return (
        <span className="text-red-400 text-xs font-medium whitespace-nowrap">
          Tutup
        </span>
      );
    }

    const shifts = [];
    if (item[`${dayPrefix}_pagi_dari`] && item[`${dayPrefix}_pagi_sampai`]) {
      shifts.push(
        `Pagi: ${item[`${dayPrefix}_pagi_dari`].slice(0, 5)}-${item[
          `${dayPrefix}_pagi_sampai`
        ].slice(0, 5)}`
      );
    }
    if (item[`${dayPrefix}_siang_dari`] && item[`${dayPrefix}_siang_sampai`]) {
      shifts.push(
        `Siang: ${item[`${dayPrefix}_siang_dari`].slice(0, 5)}-${item[
          `${dayPrefix}_siang_sampai`
        ].slice(0, 5)}`
      );
    }
    if (item[`${dayPrefix}_sore_dari`] && item[`${dayPrefix}_sore_sampai`]) {
      shifts.push(
        `Sore: ${item[`${dayPrefix}_sore_dari`].slice(0, 5)}-${item[
          `${dayPrefix}_sore_sampai`
        ].slice(0, 5)}`
      );
    }

    if (shifts.length === 0)
      return (
        <span className="text-orange-500 text-[11px] whitespace-nowrap">
          Praktek (Jam kosong)
        </span>
      );

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

  // 🔎 Filter jadwal berdasarkan searchTerm
  const filteredSchedules = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return schedules;

    return schedules.filter((item) => {
      const dokter = item.dokter?.nama_dokter?.toLowerCase() || "";
      const poli = item.poli?.poli_name?.toLowerCase() || "";
      const gedung = item.gedung?.toLowerCase() || "";
      const idDokter = String(item.dokter_id || "");
      const idPoli = String(item.poli_id || "");

      return (
        dokter.includes(term) ||
        poli.includes(term) ||
        gedung.includes(term) ||
        idDokter.includes(term) ||
        idPoli.includes(term)
      );
    });
  }, [schedules, searchTerm]);

  return (
    <AdminLayout>
      <div className="bg-white px-4 py-6 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        {/* HEADER + SEARCH */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">
            Jadwal Dokter
          </h1>

          <div className="w-full md:w-auto">
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Cari dokter / poli / gedung..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>

        {/* TABEL RESPONSIVE + SCROLL HORIZONTAL */}
        <div className="w-full overflow-x-auto pb-4 border rounded-lg">
          <table className="min-w-[1000px] sm:min-w-full divide-y divide-neutral-200">
            <thead className="bg-primary-600 text-xs sm:text-[11px] lg:text-xs">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left font-bold text-white uppercase tracking-wider min-w-[160px] sticky left-0 bg-primary-600 z-10">
                  Dokter & Poli
                </th>
                <th className="px-3 sm:px-4 py-3 text-left font-bold text-white uppercase tracking-wider">
                  Gedung
                </th>
                {[
                  "Senin",
                  "Selasa",
                  "Rabu",
                  "Kamis",
                  "Jumat",
                  "Sabtu",
                  "Minggu",
                ].map((day) => (
                  <th
                    key={day}
                    className="px-3 sm:px-4 py-3 text-left font-bold text-white uppercase tracking-wider min-w-[120px] border-l border-primary-500"
                  >
                    {day}
                  </th>
                ))}
                <th className="px-3 sm:px-4 py-3 text-center font-bold text-white uppercase tracking-wider sticky right-0 bg-primary-600 z-10">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-neutral-100 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center py-8 text-neutral-500 text-sm"
                  >
                    Memuat data jadwal...
                  </td>
                </tr>
              ) : filteredSchedules.length > 0 ? (
                filteredSchedules.map((item) => (
                  <tr
                    key={`${item.dokter_id}-${item.poli_id}`}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    {/* Dokter & Poli */}
                    <td className="px-3 sm:px-4 py-4 sticky left-0 bg-white z-10 border-r border-neutral-100 shadow-sm">
                      <div className="font-bold text-neutral-800">
                        {item.dokter?.nama_dokter || `ID: ${item.dokter_id}`}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-1">
                        {item.poli?.poli_name || `Poli ID: ${item.poli_id}`}
                      </div>
                    </td>

                    {/* Gedung */}
                    <td className="px-3 sm:px-4 py-4 text-neutral-700 text-center font-medium">
                      {item.gedung || "-"}
                    </td>

                    {/* Loop Hari */}
                    {[
                      "senin",
                      "selasa",
                      "rabu",
                      "kamis",
                      "jumat",
                      "sabtu",
                      "minggu",
                    ].map((day) => (
                      <td
                        key={day}
                        className="px-3 sm:px-4 py-4 border-l border-neutral-100 align-top"
                      >
                        {renderScheduleTime(item, day)}
                      </td>
                    ))}

                    {/* Aksi (Edit saja) */}
                    <td className="px-3 sm:px-4 py-4 text-center sticky right-0 bg-white z-10 border-l border-neutral-100 shadow-sm">
                      <div className="flex justify-center">
                        <Link
                          href={`/admin/schedule/edit/${item.dokter_id}/${item.poli_id}`}
                          className="text-neutral-400 hover:text-primary-600 p-2 rounded transition-colors bg-gray-50 hover:bg-primary-50"
                          title="Update Jadwal"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center py-12 text-neutral-400 italic text-sm"
                  >
                    Tidak ada jadwal yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
