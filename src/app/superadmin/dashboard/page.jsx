"use client";

import { useEffect, useState } from "react";
import TopNav from "@/app/superadmin/components/top_navbar";
import Header from "@/app/superadmin/components/header";
import Card from "@/app/superadmin/components/card";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function HomeSuperadminPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [reservationsToday, setReservationsToday] = useState(0);
  const [doctorsToday, setDoctorsToday] = useState(0);
  const [tableRows, setTableRows] = useState([]);

  // helper: ambil tanggal (YYYY-MM-DD) dari field apa pun
  const extractDateISO = (r) => {
    const raw =
      r.tanggal_reservasi ||
      r.tanggal ||
      r.tanggal_kunjungan ||
      r.created_at ||
      null;
    if (!raw) return null;
    return String(raw).slice(0, 10); // yyyy-mm-dd
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const res = await fetch(`${API_BASE}/reservations`, {
          headers: {
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Gagal mengambil data reservasi (status ${res.status}): ${text}`
          );
        }

        const json = await res.json();
        console.log("📌 Response dari API /reservations:", json);
        const allReservations = json?.data?.data ?? [];

        const todayISO = new Date().toISOString().slice(0, 10);

        // filter reservasi hari ini
        const todayReservations = allReservations.filter((r) => {
          const d = extractDateISO(r);
          return d === todayISO;
        });

        // total reservasi hari ini
        setReservationsToday(todayReservations.length);

        // dokter aktif hari ini (distinct)
        const doctorSet = new Set();
        todayReservations.forEach((r) => {
          const dokter =
            r.dokter?.nama ||
            r.dokter?.Nama ||
            r.jadwal_dokter?.dokter?.nama ||
            r.jadwal_dokter?.dokter?.Nama ||
            r.jadwal_dokter?.dokter_name ||
            r.dokter_name ||
            null;
          if (dokter) doctorSet.add(dokter);
        });
        setDoctorsToday(doctorSet.size);

        // group untuk tabel: per tanggal + poli + dokter
        const grouped = {};
        todayReservations.forEach((r) => {
          const dateISO = extractDateISO(r);
          if (!dateISO) return;

          const poliName =
            r.poli?.poli_name ||
            r.poli?.nama ||
            r.poli?.Nama ||
            "Poli Tidak Diketahui";

          const doctorName =
            r.dokter?.nama ||
            r.dokter?.Nama ||
            r.jadwal_dokter?.dokter?.nama ||
            r.jadwal_dokter?.dokter?.Nama ||
            r.jadwal_dokter?.dokter_name ||
            r.dokter_name ||
            "-";

          const key = `${dateISO}|${poliName}|${doctorName}`;

          if (!grouped[key]) {
            grouped[key] = {
              dateISO,
              poliName,
              doctorName,
              count: 0,
            };
          }
          grouped[key].count += 1;
        });

        const rows = Object.values(grouped).map((g) => {
          const formattedDate = new Date(g.dateISO).toLocaleDateString(
            "id-ID",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }
          );

          let note = "Sepi";
          if (g.count >= 30) note = "Ramai";
          else if (g.count >= 10) note = "Normal";

          return {
            date: formattedDate,
            poli: g.poliName,
            count: g.count,
            doctor: g.doctorName,
            note,
          };
        });

        setTableRows(rows);
      } catch (err) {
        console.error("Error fetch dashboard Superadmin:", err);
        setErrorMsg(
          err.message ||
            "Terjadi kesalahan saat mengambil data dashboard superadmin."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <main className="bg-neutral-100 min-h-screen">
      <Header />
      <TopNav />

      <div className="p-8">
        <h1 className="text-3xl font-bold mt-8 text-neutral-900">
          Selamat datang, Super Admin
        </h1>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Ringkasan Data Pasien */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">
            Ringkasan Data Pasien Hari Ini
          </h2>
          <div className="h-40 bg-neutral-200 rounded-lg flex items-center justify-center text-neutral-600 text-sm">
            {loading
              ? "Memuat ringkasan..."
              : `Total reservasi hari ini: ${reservationsToday} | Dokter aktif: ${doctorsToday}`}
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Card
            title="Jumlah Reservasi Hari Ini"
            content={loading ? "..." : String(reservationsToday)}
          />
          <Card
            title="Jumlah Dokter Aktif Hari Ini"
            content={loading ? "..." : String(doctorsToday)}
          />
          {/* Bisa tambah Card lain (misalnya total pasien unik, dsb) */}
        </div>

        {/* Detail Pasien Hari Ini */}
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
                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 text-center"
                    >
                      Memuat data...
                    </td>
                  </tr>
                )}

                {!loading && tableRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 text-center"
                    >
                      Belum ada reservasi untuk hari ini.
                    </td>
                  </tr>
                )}

                {!loading &&
                  tableRows.map((row, idx) => (
                    <tr
                      key={`${row.date}-${row.poli}-${row.doctor}-${idx}`}
                      className={idx % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {row.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {row.poli}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {row.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {row.doctor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {row.note}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
