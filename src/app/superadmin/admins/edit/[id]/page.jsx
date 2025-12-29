"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; 
import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import AdminForm from "../../../components/form/admin"; // Pastikan path import benar

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function EditAdminPage() {
  const params = useParams();
  const { id } = params; 
  const router = useRouter();
  
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token tidak ditemukan");

        const response = await fetch(`${API_BASE}/admins/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data admin");
        }

        const json = await response.json();
        // Backend show() return object admin langsung, atau { data: object }
        setAdminData(json.data || json); 
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAdmin();
    }
  }, [id]);

  if (isLoading) {
    return (
        <AdminLayout>
            <div className="flex justify-center items-center h-[50vh]">
                <p className="text-gray-500">Memuat data...</p>
            </div>
        </AdminLayout>
    );
  }

  if (error) {
    return (
        <AdminLayout>
            <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
                <p className="text-red-600 font-bold">Error: {error}</p>
                <button onClick={() => router.back()} className="text-blue-600 underline">Kembali</button>
            </div>
        </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {adminData && <AdminForm initialData={adminData} />}
      </div>
    </AdminLayout>
  );
}