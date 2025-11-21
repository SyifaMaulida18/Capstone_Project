"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "../../../components/superadmin_layou";
import FormPasien from "../../../components/form/pasien"; // Impor FormPasien

// --- Simulasi pengambilan data ---
// Ganti ini dengan API call Anda
const fetchPatientById = async (id) => {
  console.log(`Fetching data pasien untuk ID: ${id}`);
  const dummyData = {
    "1": { id: 1, nama: "Saputra", nik: "123456", telp: "081254345678" },
    "2": { id: 2, nama: "Muhammad Ole", nik: "1234567", telp: "0822123212321" },
  };
  return new Promise((resolve) =>
    setTimeout(() => resolve(dummyData[id] || null), 300)
  );
};
// ---------------------------------

export default function EditPasienPage() {
  const params = useParams();
  const { id } = params;
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        setIsLoading(true);
        const data = await fetchPatientById(id);
        setPatientData(data);
        setIsLoading(false);
      };
      loadData();
    }
  }, [id]);

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="text-center p-10">Memuat data pasien...</div>
      ) : !patientData ? (
        <div className="text-center p-10 text-red-600">
          Data pasien tidak ditemukan.
        </div>
      ) : (
        <FormPasien initialData={patientData} />
      )}
    </AdminLayout>
  );
}