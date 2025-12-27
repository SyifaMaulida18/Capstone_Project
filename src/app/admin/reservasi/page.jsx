"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/app/admin/components/admin_layout";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import api from "@/services/api";
import { useRouter } from "next/navigation";

// Simple dialog component
function Dialog({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        {children}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-neutral-600 hover:text-neutral-900 text-2xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function ReservasiPage() {
  const formatDateOnly = (d) => {
    if (!d || d === "-") return d;
    try {
      const dt = new Date(d);
      if (isNaN(dt)) return String(d).split("T")[0] || d;
      return dt.toLocaleDateString("id-ID");
    } catch (e) {
      return String(d).split("T")[0] || d;
    }
  };
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Data poli untuk ubah poli
  const [polis, setPolis] = useState([]);
  const [loadingPoli, setLoadingPoli] = useState(false);
  const [selectedPoliId, setSelectedPoliId] = useState("");

  // === FETCH RESERVASI ===
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setErrorMsg("Token tidak ditemukan. Silakan login ulang.");
        setLoading(false);
        return;
      }

      const res = await api.get("/reservations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data ?? res.data ?? [];
      const raw = Array.isArray(data) ? data : data?.data || [];

      const mapped = (raw || []).map((r) => {
        const id = r.reservid ?? r.id ?? r.reservation_id;

        return {
          id,
          userId: r.booked_user_id ?? r.userid ?? r.user?.userid ?? null,
          nama: r.nama,
          email: r.email,
          telp: r.nomor_whatsapp,
          tglLahir: r.tanggal_lahir,
          jk: r.jenis_kelamin,
          nik: r.nomor_ktp,
          wa: r.nomor_whatsapp,
          penjamin:
            r.penjaminan === "asuransi"
              ? r.nama_asuransi || "Asuransi"
              : "Cash",
          keluhan: r.keluhan,
          poli: r.poli?.poli_name ?? "-",
          poliId: r.poli_id ?? r.poli?.poli_id ?? null,
          tanggal: r.tanggal_reservasi ?? "-",
          status: r.status ?? "-",
        };
      });

      setReservations(mapped);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat mengambil data reservasi."
      );
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  const handleOpenChat = (reservasi) => {
    const userId = reservasi.userId ?? reservasi.id;
    if (!userId) {
      alert('User ID pasien tidak tersedia.');
      return;
    }

    // store a short intent so Admin Chat page can open the conversation
    localStorage.setItem('chat_open_with_id', String(userId));
    localStorage.setItem('chat_open_with_name', reservasi.nama || 'Pasien');

    router.push('/admin/chat');
  };

  // === FETCH POLI ===
  const fetchPolis = async () => {
    try {
      setLoadingPoli(true);
      const token = localStorage.getItem("token");

      const res = await api.get("/polis", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(data) ? data : data?.data || [];
      setPolis(list);
    } catch (err) {
      console.error("Gagal mengambil data poli:", err);
    } finally {
      setLoadingPoli(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // === DETAIL + UBAH POLI ===
  const handleDetail = async (reservasi) => {
    setSelectedReservation(reservasi);
    setSelectedPoliId(reservasi.poliId ?? "");

    if (polis.length === 0) {
      await fetchPolis();
    }

    setShowDetailDialog(true);
  };

  // ✅ UBAH POLI RESERVASI (PUT /reservations/{id}/change-poli)
  const handleChangePoli = async () => {
    if (!selectedReservation) return;
    if (!selectedPoliId) {
      alert("Silakan pilih poli baru terlebih dahulu.");
      return;
    }

    const id = selectedReservation.id;

    try {
      setProcessing(true);
      const token = localStorage.getItem("token");

      await api.put(
        `/reservations/${id}/change-poli`,
        { poli_id: selectedPoliId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const selectedPoliObj = polis.find(
        (p) =>
          String(p.poli_id) === String(selectedPoliId) ||
          String(p.id) === String(selectedPoliId)
      );

      const poliName =
        selectedPoliObj?.poli_name ||
        selectedPoliObj?.nama ||
        selectedPoliObj?.Nama ||
        "-";

      // update di list
      setReservations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                poliId: selectedPoliId,
                poli: poliName,
              }
            : r
        )
      );

      // update di dialog
      setSelectedReservation((prev) =>
        prev
          ? {
              ...prev,
              poliId: selectedPoliId,
              poli: poliName,
            }
          : prev
      );

      alert("Poli berhasil diperbarui.");
    } catch (err) {
      console.error("ERROR UPDATE POLI:", err);
      alert(
        err.response?.data?.message ||
          "Gagal mengubah poli. Pastikan endpoint update tersedia di backend."
      );
    } finally {
      setProcessing(false);
    }
  };

  // ✅ VERIFIKASI RESERVASI (POST /reservations/{id}/verify)
  const handleVerifyReservation = async () => {
    if (!selectedReservation) return;
    const id = selectedReservation.id;

    try {
      setProcessing(true);
      const token = localStorage.getItem("token");

      const res = await api.post(
        `/reservations/${id}/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // update status di list
      setReservations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "confirmed",
              }
            : r
        )
      );

      setSelectedReservation((prev) =>
        prev
          ? {
              ...prev,
              status: "confirmed",
            }
          : prev
      );

      alert(res.data?.message || "Reservasi berhasil diverifikasi.");
    } catch (err) {
      console.error("VERIFY ERROR:", err);
      alert(
        err.response?.data?.message ||
          "Gagal memverifikasi reservasi. Pastikan poli, dokter, dan tanggal sudah benar."
      );
    } finally {
      setProcessing(false);
    }
  };

  // ❌ BATALKAN RESERVASI (POST /reservations/{id}/cancel)
  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    const id = selectedReservation.id;

    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Yakin ingin membatalkan reservasi ini? Tindakan ini tidak dapat dibatalkan."
      );
      if (!ok) return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem("token");

      const res = await api.post(
        `/reservations/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReservations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "cancelled",
              }
            : r
        )
      );

      setSelectedReservation((prev) =>
        prev
          ? {
              ...prev,
              status: "cancelled",
            }
          : prev
      );

      alert(res.data?.message || "Reservasi berhasil dibatalkan.");
    } catch (err) {
      console.error("CANCEL ERROR:", err);
      alert(
        err.response?.data?.message ||
          "Gagal membatalkan reservasi. Pastikan status masih pending."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (id) => {
    if (typeof window === "undefined") return;
    if (window.confirm("Yakin ingin menghapus reservasi ini dari tampilan?")) {
      // Hanya hapus di FE; kalau mau benar2 delete dari DB, buat endpoint delete sendiri.
      setReservations((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // FILTER
  const filteredReservations = reservations.filter((r) => {
    const q = search.toLowerCase();
    const bySearch =
      r.nama?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.poli?.toLowerCase().includes(q) ||
      r.keluhan?.toLowerCase().includes(q);

    const byStatus =
      statusFilter === "all" ? true : r.status === statusFilter;

    return bySearch && byStatus;
  });

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-8 text-neutral-800">
          Manajemen Reservasi Pasien
        </h1>

        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3 md:ml-auto">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Cari nama, email, poli, keluhan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
            </div>

            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-neutral-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <p className="text-center text-sm text-neutral-600 mb-4">
            Mengambil data reservasi...
          </p>
        )}
        {errorMsg && (
          <p className="text-center text-sm text-red-600 mb-4">{errorMsg}</p>
        )}

        {/* TABEL */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                {[
                  "Id",
                  "Nama",
                  "Email",
                  "No Telp",
                  "Poli",
                  "Tanggal",
                  "Status",
                  "Aksi",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {!loading && filteredReservations.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-sm text-neutral-500"
                  >
                    Tidak ada data reservasi.
                  </td>
                </tr>
              )}

              {filteredReservations.map((p, i) => (
                <tr
                  key={p.id}
                  className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                >
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                    {p.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {p.nama}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {p.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {p.telp}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {p.poli}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-800">
                    {formatDateOnly(p.tanggal)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        p.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : p.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : p.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-neutral-600 hover:text-red-600 p-1 rounded-md hover:bg-red-50"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenChat(p)}
                        disabled={!p.userId}
                        className="text-neutral-600 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50"
                        title={p.userId ? `Chat dengan ${p.nama}` : 'User ID tidak tersedia'}
                      >
                        Chat
                      </button>
                      <button
                        onClick={() => handleDetail(p)}
                        className="bg-primary-500 hover:bg-primary-600 text-white text-xs px-3 py-1.5 rounded-md font-semibold transition-all"
                      >
                        Lihat detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DIALOG DETAIL + GANTI POLI + VERIFY/CANCEL */}
        <Dialog
          show={showDetailDialog}
          onClose={() => {
            if (processing) return;
            setShowDetailDialog(false);
          }}
        >
          <h2 className="text-xl font-semibold text-center mb-4 text-neutral-700">
            Detail Reservasi
          </h2>

          {selectedReservation && (
            <div className="space-y-2 text-neutral-700 text-sm leading-relaxed">
              <p>
                <strong>Nama Lengkap:</strong> {selectedReservation.nama}
              </p>
              <p>
                <strong>Tanggal Lahir:</strong> {formatDateOnly(selectedReservation.tglLahir)}
              </p>
              <p>
                <strong>Jenis Kelamin:</strong> {selectedReservation.jk}
              </p>
              <p>
                <strong>Nomor KTP:</strong> {selectedReservation.nik}
              </p>
              <p>
                <strong>Email:</strong> {selectedReservation.email}
              </p>
              <p>
                <strong>Nomor WA:</strong> {selectedReservation.wa}
              </p>
              <p>
                <strong>Penjamin:</strong> {selectedReservation.penjamin}
              </p>
              <p>
                <strong>Keluhan:</strong> {selectedReservation.keluhan}
              </p>
              <p>
                <strong>Poli saat ini:</strong> {selectedReservation.poli}
              </p>
              <p>
                <strong>Tanggal Reservasi:</strong>{" "}
                {formatDateOnly(selectedReservation.tanggal)}
              </p>
              <p>
                <strong>Status:</strong> {selectedReservation.status}
              </p>

              {/* GANTI POLI */}
              <div className="mt-4 pt-3 border-t border-neutral-200">
                <p className="text-xs text-neutral-500 mb-1">
                  Jika keluhan tidak sesuai dengan poli yang dipilih, pilih poli
                  yang lebih tepat:
                </p>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">
                  Ubah Poli
                </label>
                <select
                  value={selectedPoliId || ""}
                  onChange={(e) => setSelectedPoliId(e.target.value)}
                  disabled={loadingPoli}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                >
                  <option value="">
                    {loadingPoli ? "Memuat poli..." : "Pilih poli baru"}
                  </option>
                  {polis.map((p) => (
                    <option key={p.poli_id} value={p.poli_id}>
                      {p.poli_name}
                    </option>
                  ))}
                </select>
                <div className="mt-3 flex flex-wrap gap-3 items-center">
                  <button
                    type="button"
                    onClick={handleChangePoli}
                    disabled={processing || !selectedPoliId}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-secondary-500 text-white text-sm font-semibold hover:bg-secondary-600 disabled:opacity-60"
                  >
                    Simpan Perubahan Poli
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenChat(selectedReservation)}
                    disabled={!selectedReservation}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                  >
                    Chat Pasien
                  </button>
                </div>
              </div>

              {/* TOMBOL VERIFY & CANCEL */}
              <div className="mt-5 pt-3 border-t border-neutral-200 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCancelReservation}
                  disabled={processing || selectedReservation.status !== "pending"}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 w-full sm:w-1/2"
                >
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  Batalkan Reservasi
                </button>
                <button
                  type="button"
                  onClick={handleVerifyReservation}
                  disabled={processing || selectedReservation.status !== "pending"}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 w-full sm:w-1/2"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Verifikasi Reservasi
                </button>
              </div>

              {/* TOMBOL CHAT */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => handleOpenChat(selectedReservation)}
                  disabled={!selectedReservation}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  Chat Pasien
                </button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </AdminLayout>
  );
}
