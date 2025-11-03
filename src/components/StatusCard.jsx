const StatusCard = ({ title, value }) => {
  return (
    // UBAH: Menggunakan 'border-primary-500'
    <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-primary-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* UBAH: Menggunakan 'text-neutral-600' */}
      <h3 className="text-sm font-semibold text-neutral-600">{title}</h3>
      {/* UBAH: Menggunakan 'text-primary-600' */}
      <p className="text-4xl font-extrabold text-primary-600 mt-2">{value}</p>
    </div>
  );
};

export default StatusCard;