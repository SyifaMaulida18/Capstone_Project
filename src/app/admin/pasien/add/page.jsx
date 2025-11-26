import AdminLayout from "@/app/admin/components/admin_layout";
import FormPasien from "../../components/form/formpasien"; // Impor FormPasien

export default function AddPasienPage() {
  return (
    <AdminLayout>
      <FormPasien initialData={null} />
    </AdminLayout>
  );
}