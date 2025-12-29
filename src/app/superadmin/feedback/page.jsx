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
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "application/json", // Good practice to include
        },
      });

      if (!res.ok) throw new Error(`Gagal mengambil feedback (status ${res.status})`);

      const json = await res.json();
      
      // The controller returns: { success: true, message: ..., data: { ...pagination_object... } }
      // So 'paginator' is primarily json.data
      const paginator = json.data;

      let items = [];
      if (paginator && Array.isArray(paginator.data)) {
        items = paginator.data;
        setPage(paginator.current_page);
        setLastPage(paginator.last_page);
      } else if (Array.isArray(paginator)) {
        // Fallback if pagination is disabled or different structure
        items = paginator;
        setPage(1);
        setLastPage(1);
      } else {
         // Fallback if data is directly the array (unlikely with paginate())
         items = [];
      }

      setFeedbacks(items);
      
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

        <div className="flex gap-3 mb-4 items-center flex-wrap"> {/* Added flex-wrap for responsiveness */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">Semua Rating</option>
            <option value="5">5 Bintang</option>
            <option value="4">4 Bintang</option>
            <option value="3">3 Bintang</option>
            <option value="2">2 Bintang</option>
            <option value="1">1 Bintang</option>
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
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Terapkan
          </button>

          <div className="ml-auto text-sm text-gray-600">
            {loading ? 'Memuat...' : `${feedbacks.length} item ditampilkan`}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-3 bg-red-50 p-2 rounded border border-red-200">{error}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50 text-left text-sm text-gray-700">
              <tr>
                <th className="px-3 py-2 font-semibold">No</th>
                <th className="px-3 py-2 font-semibold">User</th>
                <th className="px-3 py-2 font-semibold">Rating</th>
                <th className="px-3 py-2 font-semibold">Kategori</th>
                <th className="px-3 py-2 font-semibold">Isi</th>
                <th className="px-3 py-2 font-semibold">Tanggal</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800 divide-y">
              {loading ? (
                 <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">Sedang memuat data...</td>
                 </tr>
              ) : feedbacks.length === 0 ? (
                 <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">Tidak ada data feedback.</td>
                 </tr>
              ) : (
                feedbacks.map((f, i) => (
                  <tr key={f.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 align-top">{(page - 1) * 10 + i + 1}</td>
                    <td className="px-3 py-2 align-top font-medium">
                        {/* Access user relation defined in controller: Feedback::with('user:userid,name,email') */}
                        {f.user?.name || 'Anonim'} 
                        {f.user?.email && <span className="block text-xs text-gray-500">{f.user.email}</span>}
                    </td>
                    <td className="px-3 py-2 align-top">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            f.rating >= 4 ? 'bg-green-100 text-green-800' : 
                            f.rating === 3 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                        }`}>
                            {f.rating} / 5
                        </span>
                    </td>
                    <td className="px-3 py-2 align-top capitalize">{f.kategori}</td>
                    <td className="px-3 py-2 align-top max-w-md break-words">{f.isi_feedback || '-'}</td>
                    <td className="px-3 py-2 align-top whitespace-nowrap text-gray-600">
                        {new Date(f.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-600">
             Halaman {page} dari {lastPage}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchFeedbacks(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => fetchFeedbacks(Math.min(lastPage, page + 1))}
              disabled={page >= lastPage || loading}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}