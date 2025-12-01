"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

function Dialog({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
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

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function VerifikasiReservasiPage() {
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [verifyingPatient, setVerifyingPatient] = useState(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  // === FETCH DATA RESERVASI DARI LARAVEL ===
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        if (!token) {
          setErrorMsg("Token tidak ditemukan. Silakan login ulang.");
          setLoading(false);
          return;
        }

        // ambil hanya status pending untuk verifikasi
        const res = await fetch(`${API_BASE}/reservations?status=pending`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Gagal mengambil data reservasi (status ${res.status}): ${text}`
          );
        }

        const json = await res.json();

        // json.data bisa berupa object paginate
        const paginateObj = json.data;
        const raw =
          Array.isArray(paginateObj) && paginateObj.length
            ? paginateObj
            : paginateObj?.data || [];

        const mapped = (raw || []).map((r) => ({
          id: r.reservid, // primaryKey di model
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
          rekomPoli: r.poli?.poli_name ?? "-",
          status: r.status,
        }));

        setReservations(mapped);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Terjadi kesalahan saat mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleDetail = (pasien) => {
    setVerifyingPatient(pasien);
    setShowVerifyDialog(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus reservasi ini?")) {
      setReservations((prev) => prev.filter((r) => r.id !== id));

      // kalau nanti mau benar-benar cancel ke backend:
      // const token = localStorage.getItem("token");
      // fetch(`${API_BASE}/reservations/${id}/cancel`, {
      //   method: "POST",
      //   headers: {
      //     Accept: "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
    }
  };

  const filteredReservations = reservations.filter(
    (r) =>
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-primary-200 max-w-6xl mx-auto min-h-[70vh]">
        <h1 className="text-2xl font-bold text-center mb-8 text-neutral-800">
          Verifikasi Reservasi Pasien
        </h1>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3 ml-auto">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Cari nama, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
            </div>

            <button className="flex items-center space-x-2 bg-white text-neutral-700 border border-neutral-200 px-4 py-2 rounded-lg shadow-sm hover:bg-neutral-100 transition-colors font-semibold">
              <FunnelIcon className="h-5 w-5 text-neutral-600" />
              <span>Filter</span>
            </button>

            <Link
              href="/superadmin/reservasi/add"
              className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-secondary-600 transition-colors font-semibold"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add</span>
            </Link>
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-primary-600 rounded-t-lg">
              <tr>
                {["Id", "Nama", "Email", "No Telp", "Aksi"].map((header) => (
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
                    colSpan={5}
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
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/superadmin/reservasi/edit/${p.id}`}
                        className="text-neutral-600 hover:text-primary-600 p-1 rounded-md hover:bg-primary-50"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-neutral-600 hover:text-red-600 p-1 rounded-md hover:bg-red-50"
                      >
                        <TrashIcon className="h-5 w-5" />
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

        <Dialog
          show={showVerifyDialog}
          onClose={() => setShowVerifyDialog(false)}
        >
          <h2 className="text-xl font-semibold text-center mb-4 text-neutral-700">
            Verifikasi Reservasi Pasien
          </h2>
          {verifyingPatient && (
            <div className="space-y-2 text-neutral-700 text-sm leading-relaxed">
              <p>
                <strong>Nama Lengkap:</strong> {verifyingPatient.nama}
              </p>
              <p>
                <strong>Tanggal Lahir:</strong> {verifyingPatient.tglLahir}
              </p>
              <p>
                <strong>Jenis Kelamin:</strong> {verifyingPatient.jk}
              </p>
              <p>
                <strong>Nomor KTP:</strong> {verifyingPatient.nik}
              </p>
              <p>
                <strong>Email:</strong> {verifyingPatient.email}
              </p>
              <p>
                <strong>Nomor WA:</strong> {verifyingPatient.wa}
              </p>
              <p>
                <strong>Penjamin:</strong> {verifyingPatient.penjamin}
              </p>
              <p>
                <strong>Keluhan:</strong> {verifyingPatient.keluhan}
              </p>
              <p>
                <strong>Rekomendasi Poli:</strong> {verifyingPatient.rekomPoli}
              </p>
            </div>
          )}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setShowVerifyDialog(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-lg font-bold"
            >
              ✖
            </button>
            <button
              onClick={() => setShowVerifyDialog(false)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-lg font-bold"
            >
              ✔
            </button>
          </div>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
