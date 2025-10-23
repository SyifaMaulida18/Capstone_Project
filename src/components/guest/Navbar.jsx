import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg px-6 lg:px-12 py-4 flex justify-between items-center sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-blue-600">Reservasi Medis</h1>
      <div className="space-x-4">
        <Link href="/dashboard" className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
          Dashboard
        </Link>
        <Link href="/profile" className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
          Profil
        </Link>
        {/* Tambahkan tombol Logout di sini */}
        <button className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;