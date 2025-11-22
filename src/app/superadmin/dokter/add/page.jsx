"use client";
import FormDokter from "../../components/form/dokter"; 
import SuperAdminLayout from "../../components/superadmin_layout";

export default function AddDokterPage() {
  return (
    <SuperAdminLayout>
      <div className="p-6">
        <FormDokter />
      </div>
    </SuperAdminLayout>
  );
}