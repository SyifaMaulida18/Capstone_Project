"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowPathIcon,
  PhoneArrowDownLeftIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "@/app/admin/components/admin_layout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

const MEDICAL_RECORDS_PATH = "/admin/rekam-medis";

export default function AntrianDashboardPage() {
  const [polis, setPolis] = useState([]);
  const [selectedPoli, setSelectedPoli] = useState("");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  );

  const [loading, setLoading] = useState(false);
  const [loadingPoli, setLoadingPoli] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [sedangDipanggil, setSedangDipanggil] = useState(null);
  const [sisaAntrian, setSisaAntrian] = useState(0);
  const [daftarTunggu, setDaftarTunggu] = useState([]);

  // === 1. AMBIL DATA POLI UNTUK DROPDOWN ===
  useEffect(() => {
    const fetchPolis = async () => {
      try {
        setLoadingPoli(true);
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/polis`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        const data = json.data || json;

        setPolis(data);
        if (data.length > 0) {
          setSelectedPoli(data[0].poli_id.toString());
        }
      } catch (err) {
        console.error("Gagal ambil poli:", err);
        setErrorMsg("Gagal mengambil data poli.");
      } finally {
        setLoadingPoli(false);
      }
    };

    fetchPolis();
  }, []);

  // === 2. FUNGSI FETCH DASHBOARD ANTRIAN ===
  const fetchDashboard = async () => {
    if (!selectedPoli || !tanggal) return;
    try {
      setLoading(true);
      setErrorMsg("");

      const token = localStorage.getItem("token");

      const url = `${API_BASE}/antrian/dashboard?poli_id=${encodeURIComponent(
        selectedPoli
      )}&tanggal=${encodeURIComponent(tanggal)}`;

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Gagal mengambil data antrian (status ${res.status}): ${text}`
        );
      }

      const json = await res.json();
      const data = json.data || {};

      setSedangDipanggil(data.sedang_dipanggil || null);
      setSisaAntrian(data.sisa_antrian || 0);
      setDaftarTunggu(data.daftar_tunggu || []);
    } catch (err) {
      console.error("Error fetch dashboard:", err);
      setErrorMsg(
        err.message || "Terjadi kesalahan saat mengambil data antrian."
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch ketika poli & tanggal sudah ready
  useEffect(() => {
    if (!loadingPoli && selectedPoli && tanggal) {
      fetchDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingPoli, selectedPoli, tanggal]);

  // === 3. PANGGIL BERIKUTNYA ===
  const handlePanggilBerikutnya = async () => {
    if (!selectedPoli) {
      alert("Silakan pilih poli terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/antrian/panggil-berikutnya`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          poli_id: selectedPoli,
          tanggal, // ✅ kirim tanggal yang sama dengan dashboard
        }),
      });

      const json = await res.json();

      if (res.status === 404 && json.message === "Tidak ada antrian lagi.") {
        alert("Tidak ada antrian lagi untuk poli dan tanggal ini.");
        return;
      }

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memanggil antrian berikutnya.");
      }

      await fetchDashboard();
      alert(json.message);
    } catch (err) {
      console.error("Error panggil berikutnya:", err);
      alert(err.message || "Terjadi kesalahan saat memanggil antrian.");
    } finally {
      setLoading(false);
    }
  };

  // === 3b. SELESAIKAN PANGGILAN SAAT INI ===
  const handleSelesaikanPanggilan = async () => {
    if (!sedangDipanggil) {
      alert("Tidak ada antrian yang sedang dipanggil.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/antrian/selesaikan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // kirim nomor_antrian (dan antrian_id kalau backend butuh)
          nomor_antrian: sedangDipanggil.nomor_antrian,
          antrian_id: sedangDipanggil.id ?? sedangDipanggil.antrian_id,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const msgFromValidation =
          json?.errors?.antrian_id?.[0] ||
          json?.errors?.nomor_antrian?.[0] ||
          json.message;

        throw new Error(msgFromValidation || "Gagal menyelesaikan panggilan.");
      }

      await fetchDashboard();
      alert(json.message || "Panggilan antrian telah diselesaikan.");
    } catch (err) {
      console.error("Error selesaikan panggilan:", err);
      alert(err.message || "Terjadi kesalahan saat menyelesaikan panggilan.");
    } finally {
      setLoading(false);
    }
  };

  // === 4. RENDER ===
  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-6 text-neutral-800">
          Dashboard Antrian Poli
        </h1>

        {/* FILTER POLI & TANGGAL */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">
                Poli
              </label>
              <select
                value={selectedPoli}
                onChange={(e) => setSelectedPoli(e.target.value)}
                disabled={loadingPoli}
                className="w-full md:w-64 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                {loadingPoli && <option>Memuat...</option>}
                {!loadingPoli &&
                  polis.map((p) => (
                    <option key={p.poli_id} value={p.poli_id}>
                      {p.poli_name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">
                Tanggal Antrian
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full md:w-48 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={fetchDashboard}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-sm font-semibold"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleSelesaikanPanggilan}
              disabled={loading || !sedangDipanggil}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-semibold shadow-md disabled:opacity-60"
            >
              Selesaikan Panggilan
            </button>
            <button
              type="button"
              onClick={handlePanggilBerikutnya}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary-500 text-white hover:bg-secondary-600 text-sm font-semibold shadow-md"
            >
              <PhoneArrowDownLeftIcon className="h-4 w-4" />
              Panggil Berikutnya
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* KARTU RINGKASAN */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-primary-100 bg-primary-50 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary-600">
              <UsersIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-neutral-600">Sisa Antrian</p>
              <p className="text-xl font-bold text-primary-700">
                {sisaAntrian}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-100 bg-amber-50">
            <p className="text-xs text-neutral-600 mb-1">Sedang Dipanggil</p>
            {sedangDipanggil ? (
              <>
                <p className="text-lg font-bold text-amber-700">
                  {sedangDipanggil.nomor_antrian}
                </p>
                <p className="text-xs text-neutral-600 mt-1">
                  Dipanggil pada:{" "}
                  {sedangDipanggil.waktu_panggil
                    ? new Date(
                        sedangDipanggil.waktu_panggil
                      ).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </p>

                {sedangDipanggil.reservation_id &&
                  sedangDipanggil.reservation?.user && (
                    <div className="mt-3">
                      <Link
                        href={`${MEDICAL_RECORDS_PATH}?reservasi_id=${
                          sedangDipanggil.reservation_id
                        }&patient_id=${
                          sedangDipanggil.reservation.user.userid
                        }&patient_name=${encodeURIComponent(
                          sedangDipanggil.reservation.user.name || ""
                        )}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                      >
                        Tambah Rekam Medis
                      </Link>
                    </div>
                  )}
              </>
            ) : (
              <p className="text-sm text-neutral-500">
                Belum ada antrian aktif
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50">
            <p className="text-xs text-neutral-600 mb-1">Tanggal</p>
            <p className="text-lg font-semibold text-neutral-800">
              {new Date(tanggal).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* TABEL DAFTAR TUNGGU */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-primary-600">
              <tr>
                {[
                  "No",
                  "Nomor Antrian",
                  "Status",
                  "Waktu Panggil",
                  "Waktu Selesai",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {daftarTunggu.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-neutral-500"
                  >
                    Belum ada antrian untuk poli dan tanggal ini.
                  </td>
                </tr>
              )}

              {daftarTunggu.map((row, idx) => (
                <tr
                  key={row.id}
                  className={idx % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                >
                  <td className="px-6 py-3 text-sm text-neutral-800">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-neutral-900">
                    {row.nomor_antrian}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        row.status === "menunggu"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          : row.status === "dipanggil"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : row.status === "selesai"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-neutral-50 text-neutral-700 border border-neutral-200"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-neutral-800">
                    {row.waktu_panggil
                      ? new Date(row.waktu_panggil).toLocaleTimeString(
                          "id-ID",
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-sm text-neutral-800">
                    {row.waktu_selesai
                      ? new Date(row.waktu_selesai).toLocaleTimeString(
                          "id-ID",
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : "-"}
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
