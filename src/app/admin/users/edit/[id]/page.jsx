"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin_layout";
import FormUser from "../../../components/form/formusers";

export default function EditUserPage() {
  const params = useParams();
  const { id } = params;
  
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

        // --- CARA EFISIEN: Langsung panggil ID ---
        // Karena UserController sudah punya method show($id)
        const response = await fetch(`${baseUrl}/users/${id}`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) throw new Error("Token tidak valid atau kadaluarsa. Silakan login ulang.");
          if (response.status === 403) throw new Error("Akses ditolak. Halaman ini khusus Superadmin.");
          if (response.status === 404) throw new Error("User tidak ditemukan di database.");
          throw new Error("Gagal mengambil data user");
        }

        const result = await response.json();
        const apiData = result.data; // Mengambil object user dari key 'data'

        // Mapping data dari Backend ke format Form Frontend
        // Perhatikan: Controller Anda memakai validasi 'userid', jadi kemungkinan primary key-nya 'userid'
        const formattedData = {
            id: apiData.userid || apiData.id, 
            nama: apiData.name,            
            email: apiData.email,          
            telp: apiData.nomor_telepon,    
        };

        setUserData(formattedData);

      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return (
    <AdminLayout>
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-neutral-600 font-medium animate-pulse">Memuat data user...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : !userData ? (
          <div className="text-center p-10 text-neutral-600">
            Data user tidak ditemukan.
          </div>
        ) : (
          <FormUser initialData={userData} />
        )}
      </div>
    </AdminLayout>
  );
}