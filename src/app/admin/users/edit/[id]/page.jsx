"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "@/app/admin/components/admin_layout";
import FormUser from "../../../components/form/formusers"; // Impor FormUser

// --- Simulasi pengambilan data ---
// Ganti ini dengan API call Anda
const fetchUserById = async (id) => {
  console.log(`Fetching data user untuk ID: ${id}`);
  const dummyData = {
    "1": { id: 1, nama: "Saputra", email: "saputra123@gmail.com", telp: "081254345678" },
    "2": { id: 2, nama: "Muhammad Ole", email: "oleganz123@gmail.com", telp: "0822123212321" },
  };
  return new Promise((resolve) =>
    setTimeout(() => resolve(dummyData[id] || null), 300)
  );
};
// ---------------------------------

export default function EditUserPage() {
  const params = useParams();
  const { id } = params;
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        setIsLoading(true);
        const data = await fetchUserById(id);
        setUserData(data);
        setIsLoading(false);
      };
      loadData();
    }
  }, [id]);

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="text-center p-10">Memuat data user...</div>
      ) : !userData ? (
        <div className="text-center p-10 text-red-600">
          Data user tidak ditemukan.
        </div>
      ) : (
        <FormUser initialData={userData} />
      )}
    </AdminLayout>
  );
}