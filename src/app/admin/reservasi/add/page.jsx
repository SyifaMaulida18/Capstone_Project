import AdminLayout from "@/app/admin/components/admin_layout";
import FormReservasi from "../../components/form/formreservasi"; // Path ke komponen form

export default function AddReservasiPage() {
  return (
    <AdminLayout>
      {/* Kita bungkus form di dalam layout */}
      <FormReservasi initialData={null} />
    </AdminLayout>
  );
}