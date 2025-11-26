"use client";
import Schedule from "../../components/form/schedule"; 
import SuperAdminLayout from "../../components/superadmin_layout";

export default function AddSchedulePage() {
  return (
    <SuperAdminLayout>
      <div className="p-6">
        <Schedule />
      </div>
    </SuperAdminLayout>
  );
}