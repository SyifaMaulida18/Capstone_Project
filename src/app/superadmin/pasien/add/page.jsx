import AdminLayout from "../../components/superadmin_layou";
import FormPasien from "../../components/form/pasien"; // Impor FormPasien

export default function AddPasienPage() {
  return (
    <AdminLayout>
      <FormPasien initialData={null} />
    </AdminLayout>
  );
}