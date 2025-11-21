import SuperAdminLayout from "../../components/superadmin_layou";
import FormDokterSuperAdmin from "../../components/form/dokter";

export default function AddDokterPage() {
  return (
    <SuperAdminLayout>
      <FormDokterSuperAdmin initialData={null} />
    </SuperAdminLayout>
  );
}