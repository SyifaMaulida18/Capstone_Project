"use client";

import AdminLayout from "@/app/superadmin/components/superadmin_layout";
import AdminForm from "../../components/form/admin"; // Pastikan path import benar

export default function AddAdminPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <AdminForm />
      </div>
    </AdminLayout>
  );
}