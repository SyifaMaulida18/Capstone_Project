"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "../../../../components/admin_layout"; // Path naik 4 level
import JadwalForm from "../../../../components/form/schedule";

export default function EditSchedulePage() {
  const params = useParams();
  const { dokter_id, poli_id } = params; 
  
  const [jadwalData, setJadwalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJadwal = async () => {
      if (!dokter_id || !poli_id) return;
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

        const response = await fetch(`${baseUrl}/jadwal-dokter/${dokter_id}/${poli_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const result = await response.json();
          setJadwalData(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJadwal();
  }, [dokter_id, poli_id]);

  return (
    <AdminLayout>
      <div className="p-6">
        {isLoading ? <div>Memuat...</div> : jadwalData ? <JadwalForm initialData={jadwalData} /> : <div>Data tidak ditemukan</div>}
      </div>
    </AdminLayout>
  );
}