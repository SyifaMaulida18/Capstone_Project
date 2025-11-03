import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg px-6 lg:px-12 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* UBAH: Menggunakan 'primary-600' */}
      <h1 className="text-2xl font-bold text-primary-600">Reservasi Medis</h1>
      <div className="space-x-4">
        <Link
          href="/dashboard"
          // UBAH: Menggunakan 'primary-600' dan 'primary-800'
          className="text-primary-600 font-medium hover:text-primary-800 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/profile"
          // UBAH: Menggunakan 'primary-600' dan 'primary-800'
          className="text-primary-600 font-medium hover:text-primary-800 transition-colors"
        >
          Profil
        </Link>
        {/* Tambahkan tombol Logout di sini */}
        <button
          // UBAH: Menggunakan 'primary-500' dan 'primary-600' sesuai config
          className="px-4 py-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors duration-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;