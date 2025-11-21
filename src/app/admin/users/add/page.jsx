import AdminLayout from "@/app/admin/components/admin_layout";
import FormUser from "../../components/form/formusers";

export default function AddUserPage() {
  return (
    <AdminLayout>
      <FormUser initialData={null} />
    </AdminLayout>
  );
}