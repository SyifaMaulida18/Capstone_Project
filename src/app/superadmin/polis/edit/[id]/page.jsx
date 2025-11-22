"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SuperAdminLayout from "../../../components/superadmin_layout";
import FormPoli from "../../../components/form/poli";

export default function EditPoliPage() {
  const { id } = useParams(); // Ini akan menangkap 'poli_id' dari URL (misal: "P001")
  
  const [poliData, setPoliData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoli = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
        
        // GET /polis/{id}
        const response = await fetch(`${baseUrl}/polis/${id}`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data poli");
        }

        const data = await response.json();
        // Mapping jika perlu, tapi biasanya Controller show($id) langsung return object Poli
        // Cek apakah dibungkus 'data' atau langsung object
        setPoliData(data.data || data); 

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPoli();
  }, [id]);

  return (
    <SuperAdminLayout>
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh] text-neutral-500">Memuat data poli...</div>
        ) : error ? (
          <div className="text-center p-10 text-red-600">{error}</div>
        ) : poliData ? (
          <FormPoli initialData={poliData} />
        ) : (
          <div className="text-center p-10 text-neutral-600">Data tidak ditemukan.</div>
        )}
      </div>
    </SuperAdminLayout>
  );
}