"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SuperAdminLayout from "../../../components/superadmin_layout";
import FormDokter from "../../../components/form/dokter";

export default function EditDokterPage() {
  const params = useParams();
  const id = params?.id; // pastikan aman kalau undefined

  const [dokterData, setDokterData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDokter = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "http://127.0.0.1:8000/api";

        const response = await fetch(`${baseUrl}/dokters/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(
            errJson.message || `Gagal mengambil data dokter (status ${response.status})`
          );
        }

        const json = await response.json();

        // handle dua kemungkinan bentuk respons:
        // 1) { data: {...dokter} }
        // 2) {...dokter}
        const dokter =
          json && typeof json === "object" && json.data
            ? json.data
            : json;

        setDokterData(dokter);
      } catch (err) {
        console.error("Fetch dokter gagal:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDokter();
  }, [id]);

  return (
    <SuperAdminLayout>
      <div className="p-6">
        {isLoading && <div>Memuat...</div>}

        {!isLoading && error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && !dokterData && (
          <div>Data tidak ditemukan.</div>
        )}

        {!isLoading && !error && dokterData && (
          <FormDokter initialData={dokterData} />
        )}
      </div>
    </SuperAdminLayout>
  );
}
