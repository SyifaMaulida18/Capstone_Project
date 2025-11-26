"use client";

import FormPoli from "../../components/form/poli"; 
import SuperAdminLayout from "../../components/superadmin_layout";

export default function AddPoliPage() {
  return (
    <SuperAdminLayout>
      <div className="p-6">
        <FormPoli />
      </div>
    </SuperAdminLayout>
  );
}