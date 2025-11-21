"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; 
import Admin from "../../../components/form/admin"; 

export default function EditAdminPage() {
  const params = useParams(); // Ambil parameter [id]
  const { id } = params; 
  
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token tidak ditemukan");

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
        const response = await fetch(`${baseUrl}/admins/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data admin");
        }

        const data = await response.json();
        setAdminData(data);
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

  if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      {adminData && <Admin initialData={adminData} />}
    </div>
  );
}