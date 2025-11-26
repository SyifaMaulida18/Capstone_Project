"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SuperAdminLayout from "../../../components/superadmin_layout";
import FormDokter from "../../../components/form/dokter";

export default function EditDokterPage() {
  const { id } = useParams(); 
  const [dokterData, setDokterData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDokter = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        
        const response = await fetch(`${baseUrl}/dokters/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setDokterData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDokter();
  }, [id]);

  return (
    <SuperAdminLayout>
      <div className="p-6">
        {isLoading ? <div>Memuat...</div> : dokterData ? <FormDokter initialData={dokterData} /> : <div>Data tidak ditemukan</div>}
      </div>
    </SuperAdminLayout>
  );
}