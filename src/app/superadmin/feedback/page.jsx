"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function SuperadminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [error, setError] = useState("");

  const fetchFeedbacks = async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const q = new URLSearchParams();
      if (ratingFilter) q.set("rating", ratingFilter);
      if (kategoriFilter) q.set("kategori", kategoriFilter);
      q.set("page", p);

      const res = await fetch(`${API_BASE}/feedback?${q.toString()}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error(`Gagal mengambil feedback (status ${res.status})`);
      const json = await res.json();
      const paginator = json.data ?? json;
      // Normalize items: paginator may be a paginator object with .data array, or an array itself
      let items = [];
      if (paginator) {
        if (Array.isArray(paginator.data)) items = paginator.data;
        else if (Array.isArray(paginator)) items = paginator;
      }
      setFeedbacks(items);
      setPage((paginator && (paginator.current_page ?? paginator.currentPage)) ?? p);
      setLastPage((paginator && (paginator.last_page ?? paginator.lastPage)) ?? 1);
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratingFilter, kategoriFilter]);

  return (
    <AdminLayout>
      <div className="p-6 bg-white rounded shadow min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Feedback - Superadmin</h1>

        <div className="flex gap-3 mb-4 items-center">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">Semua Rating</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>

          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">Semua Kategori</option>
            <option value="umum">Umum</option>
            <option value="bug">Bug</option>
            <option value="pelayanan">Pelayanan</option>
            <option value="lainnya">Lainnya</option>
          </select>

          <button
            onClick={() => fetchFeedbacks(1)}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Terapkan
          </button>

          <div className="ml-auto text-sm text-gray-600">{loading ? 'Memuat...' : `${feedbacks.length} item`}</div>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50 text-left text-sm text-gray-700">
              <tr>
                <th className="px-3 py-2">No</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Rating</th>
                <th className="px-3 py-2">Kategori</th>
                <th className="px-3 py-2">Isi</th>
                <th className="px-3 py-2">Tanggal</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {feedbacks.map((f, i) => (
                <tr key={f.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 align-top">{(page - 1) * 10 + i + 1}</td>
                  <td className="px-3 py-2 align-top">{f.user?.name ?? f.user_name ?? 'Anonim'}</td>
                  <td className="px-3 py-2 align-top">{f.rating}</td>
                  <td className="px-3 py-2 align-top">{f.kategori}</td>
                  <td className="px-3 py-2 align-top">{f.isi_feedback || '-'}</td>
                  <td className="px-3 py-2 align-top">{new Date(f.created_at).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <button
              onClick={() => fetchFeedbacks(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-2 border rounded mr-2 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => fetchFeedbacks(Math.min(lastPage, page + 1))}
              disabled={page >= lastPage}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
          <div className="text-sm text-gray-600">Halaman {page} / {lastPage}</div>
        </div>
      </div>
    </AdminLayout>
  );
}
