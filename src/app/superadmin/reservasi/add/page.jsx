import AdminLayout from "@/app/superadmin/components/superadmin_layou";
import FormReservasi from "../../components/form/reservasi"; // Path ke komponen form

export default function AddReservasiPage() {
  return (
    <AdminLayout>
      {/* Kita bungkus form di dalam layout */}
      <FormReservasi initialData={null} />
    </AdminLayout>
  );
}