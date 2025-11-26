import AdminLayout from "@/app/admin/components/admin_layout";
import FormDokter from "../../components/form/formdokter"; // Path ke komponen form

export default function AddDokterPage() {
  return (
    <AdminLayout>
      {/* Kita bungkus form di dalam layout */}
      <FormDokter initialData={null} />
    </AdminLayout>
  );
}