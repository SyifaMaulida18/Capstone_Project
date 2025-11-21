"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "@/app/superadmin/components/superadmin_layou";
import FormReservasi from "../../../components/form/reservasi"; // Path ke komponen form

// --- Simulasi pengambilan data ---
// Ganti ini dengan API call Anda
const fetchReservationById = async (id) => {
  console.log(`Fetching data reservasi untuk ID: ${id}`);
  // Menggunakan data dummy dari file list
  const dummyData = {
    "1": {
      id: 1,
      nama: "Ayu Gideon",
      email: "ayugideon@gmail.com",
      telp: "081254345678",
      tglLahir: "1997-07-12",
      jk: "Perempuan",
      nik: "12321323",
      wa: "08123123123",
      penjamin: "BPJS",
      keluhan: "Sering sakit kepala",
      rekomPoli: "Saraf",
    },
    "2": {
      id: 2,
      nama: "Niko Affandi",
      email: "nikoaffandi@gmail.com",
      telp: "0822123212321",
      tglLahir: "1995-03-05",
      jk: "Laki-laki",
      nik: "12345678",
      wa: "0821123123123",
      penjamin: "Swasta",
      keluhan: "Demam dan batuk",
      rekomPoli: "Umum",
    },
    "3": {
      id: 3,
      nama: "Angger Karis",
      email: "anggerkaris@gmail.com",
      telp: "0821321321321",
      tglLahir: "1997-07-12",
      jk: "Laki-laki",
      nik: "132132133",
      wa: "0821321321321",
      penjamin: "Swasta",
      keluhan: "Sering mual saat ingin BAB",
      rekomPoli: "Organ Dalam",
    },
  };
  return new Promise((resolve) =>
    setTimeout(() => resolve(dummyData[id] || null), 300)
  );
};
// ---------------------------------

export default function EditReservasiPage() {
  const params = useParams();
  const { id } = params;
  const [reservationData, setReservationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        setIsLoading(true);
        const data = await fetchReservationById(id);
        setReservationData(data);
        setIsLoading(false);
      };
      loadData();
    }
  }, [id]);

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="text-center p-10">Memuat data reservasi...</div>
      ) : !reservationData ? (
        <div className="text-center p-10 text-red-600">
          Data reservasi tidak ditemukan.
        </div>
      ) : (
        <FormReservasi initialData={reservationData} />
      )}
    </AdminLayout>
  );
}