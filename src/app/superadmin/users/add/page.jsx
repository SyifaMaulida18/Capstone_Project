import AdminLayout from "@/app/superadmin/components/superadmin_layou";
import FormUser from "../../components/form/users";

export default function AddUserPage() {
  return (
    <AdminLayout>
      <FormUser initialData={null} />
    </AdminLayout>
  );
}