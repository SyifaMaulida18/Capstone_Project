"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "@/app/admin/components/admin_layout";
import FormDokter from "../../../components/form/formdokter"; // Path ke komponen form

// --- Simulasi pengambilan data ---
// Ganti ini dengan API call Anda
const fetchDoctorById = async (id) => {
  console.log(`Fetching data untuk ID: ${id}`);
  const dummyData = {
    "1": { id: 1, nama: "Saputra", spesialis: "jantung", telp: "081254345678" },
    "2": { id: 2, nama: "Muhammad Ole", spesialis: "organ dalam", telp: "0822123212321" },
  };
  return new Promise((resolve) =>
    setTimeout(() => resolve(dummyData[id] || null), 300)
  );
};
// ---------------------------------

export default function EditDokterPage() {
  const params = useParams();
  const { id } = params;
  const [doctorData, setDoctorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        setIsLoading(true);
        const data = await fetchDoctorById(id);
        setDoctorData(data);
        setIsLoading(false);
      };
      loadData();
    }
  }, [id]);

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="text-center p-10">Memuat data dokter...</div>
      ) : !doctorData ? (
        <div className="text-center p-10 text-red-600">
          Data dokter tidak ditemukan.
        </div>
      ) : (
        <FormDokter initialData={doctorData} />
      )}
    </AdminLayout>
  );
}