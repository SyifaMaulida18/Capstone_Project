"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SuperAdminLayout from "../../../components/superadmin_layout";
import FormPoli from "../../../components/form/poli";

export default function EditPoliPage() {
  const { id } = useParams(); 
  const [poliData, setPoliData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPoli = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
        
        const response = await fetch(`${baseUrl}/polis/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setPoliData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPoli();
  }, [id]);

  return (
    <SuperAdminLayout>
      <div className="p-6">
        {isLoading ? <div>Memuat...</div> : poliData ? <FormPoli initialData={poliData} /> : <div>Data tidak ditemukan</div>}
      </div>
    </SuperAdminLayout>
  );
}