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
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await fetch(`${baseUrl}/users/${id}`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data user");
        }

        const result = await response.json();
        const apiData = result.data; // Data asli dari Laravel (name, email, nomor_telepon)

        const formattedData = {
            id: apiData.userid,
            nama: apiData.name,             // Mapping: name -> nama
            email: apiData.email,           // Mapping: email -> email
            telp: apiData.nomor_telepon,    // Mapping: nomor_telepon -> telp
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