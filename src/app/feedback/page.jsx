"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [kategori, setKategori] = useState("umum");
  const [isi, setIsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_BASE}/feedback`);
      if (!res.ok) throw new Error("Gagal mengambil feedback");
      const json = await res.json();
      // controller returns paginated { data: { data: [...] } } or { data: [...] }
      const items = json.data?.data ?? json.data ?? json.data?.data ?? json;
      // normalize array
      const arr = Array.isArray(items) ? items : items.data ?? items;
      setFeedbacks(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ rating: Number(rating), kategori, isi_feedback: isi }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403) throw new Error(json.message || "Anda sudah mengirim feedback hari ini");
        if (res.status === 422) throw new Error(Object.values(json.errors || {}).flat().join(" ") || json.message || "Validasi gagal");
        throw new Error(json.message || `Submit failed (${res.status})`);
      }

      setSuccess(json.message || "Feedback berhasil dikirim");
      setIsi("");
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Kirim Feedback</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Rating</label>
          <select value={rating} onChange={(e)=>setRating(e.target.value)} className="px-3 py-2 border rounded w-32">
            {[5,4,3,2,1].map((r)=> (<option key={r} value={r}>{r} ⭐</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Kategori</label>
          <select value={kategori} onChange={(e)=>setKategori(e.target.value)} className="px-3 py-2 border rounded w-48">
            <option value="umum">Umum</option>
            <option value="bug">Bug</option>
            <option value="pelayanan">Pelayanan</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Isi Feedback (opsional)</label>
          <textarea value={isi} onChange={(e)=>setIsi(e.target.value)} rows={4} className="w-full p-2 border rounded" placeholder="Cerita singkat tentang pengalaman Anda..." />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Mengirim...' : 'Kirim Feedback'}
          </button>
        </div>
      </form>

      <h2 className="text-xl font-semibold mb-3">Feedback Terakhir</h2>
      <div className="space-y-3">
        {feedbacks.length === 0 && <p className="text-sm text-gray-500">Belum ada feedback.</p>}
        {feedbacks.map((f) => (
          <div key={f.id || f.feedback_id || Math.random()} className="p-3 border rounded">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">{f.user?.name || f.user_name || 'Anonim'}</div>
              <div className="text-sm text-gray-600">{new Date(f.created_at || f.createdAt || f.created).toLocaleString()}</div>
            </div>
            <div className="mt-1 text-yellow-700">Rating: {f.rating}</div>
            <div className="text-sm text-gray-700">Kategori: {f.kategori}</div>
            {f.isi_feedback && <p className="mt-2 text-gray-800">{f.isi_feedback}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
