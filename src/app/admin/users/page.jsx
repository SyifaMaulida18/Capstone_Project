"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SuperAdminLayout from "../../../components/superadmin_layout"; 
import FormUser from "../../../components/form/users"; 

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
        
        // Gunakan fallback URL jika env tidak terbaca
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

        // --- PERUBAHAN UTAMA (FRONTEND ONLY FIX) ---
        // Karena endpoint /users/{id} 404 (belum ada di backend),
        // Kita panggil /users (List Semua User) lalu filter di sini.
        const response = await fetch(`${baseUrl}/users`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil daftar user");
        }

        const result = await response.json();
        
        // Ambil array data (backend Anda mengembalikan { success: true, data: [...] })
        const allUsers = result.data || [];

        // --- FILTER MANUAL DI JAVASCRIPT ---
        // Cari user yang ID-nya sama dengan parameter URL
        // Kita cek field 'id' atau 'userid' (tergantung database Anda)
        const foundUser = allUsers.find(u => 
            String(u.id) === String(id) || String(u.userid) === String(id)
        );

        if (!foundUser) {
            throw new Error("User tidak ditemukan di database.");
        }

        // Format data sesuai kebutuhan Form
        const formattedData = {
            id: foundUser.userid || foundUser.id,
            nama: foundUser.name,            
            email: foundUser.email,          
            telp: foundUser.nomor_telepon,    
            // Tambahkan field lain jika perlu, misal password dikosongkan
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
    <SuperAdminLayout>
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
    </SuperAdminLayout>
  );
}