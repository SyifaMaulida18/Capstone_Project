"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import { Input } from "@/app/superadmin/components/ui/input";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function EditRekamMedisPage({ params }) {
  const router = useRouter();
  const { id } = params; // Mendapatkan ID dari URL
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    no_medrec: "",
    diagnosis: "",
    tanggal_diperiksa: "",
    // Field lain ditampilkan readonly karena backend 'update' membatasi input
    tindakan: "", 
  });

  useEffect(() => {
    const fetchDetail = async () => {
        const token = localStorage.getItem("token");
        // Karena route show() mungkin tidak ada, kita filter manual dari list atau endpoint show jika ada
        // Asumsi: Backend menggunakan Route::apiResource, maka ada endpoint GET /rekam-medis/{id}
        try {
            const res = await fetch(`${API_BASE}/rekam-medis/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            const data = json.data || json; // Sesuaikan wrapper response

            setForm({
                no_medrec: data.no_medrec || "",
                diagnosis: data.diagnosis || "",
                tindakan: data.tindakan || "",
                tanggal_diperiksa: data.tanggal_diperiksa || "",
            });
        } catch(err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    fetchDetail();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_BASE}/rekam-medis/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                no_medrec: form.no_medrec,
                diagnosis: form.diagnosis,
                tanggal_diperiksa: form.tanggal_diperiksa,
                // tindakan: form.tindakan // (Optional: Jika backend diupdate support tindakan)
            })
        });

        if(!res.ok) throw new Error("Gagal update");
        
        alert("Berhasil diperbarui");
        router.push("/superadmin/rekam-medis");
    } catch(err) {
        alert(err.message);
    }
  };

  if(loading) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
       <div className="bg-white p-8 rounded-xl shadow-lg border max-w-2xl mx-auto mt-8">
         <h1 className="text-xl font-bold mb-6">Edit Rekam Medis</h1>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">No Medrec</label>
                <Input value={form.no_medrec} onChange={(e) => setForm({...form, no_medrec: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Tanggal Diperiksa</label>
                <Input type="date" value={form.tanggal_diperiksa} onChange={(e) => setForm({...form, tanggal_diperiksa: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Diagnosis</label>
                <textarea 
                    className="w-full border rounded p-2" 
                    rows={3}
                    value={form.diagnosis} 
                    onChange={(e) => setForm({...form, diagnosis: e.target.value})} 
                />
            </div>
            {/* Field Readonly (karena backend update tidak menyertakan ini) */}
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-400">Tindakan (Read Only)</label>
                <textarea 
                    className="w-full border rounded p-2 bg-gray-100 text-gray-500" 
                    rows={3}
                    readOnly
                    value={form.tindakan} 
                />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
         </form>
       </div>
    </AdminLayout>
  );
}