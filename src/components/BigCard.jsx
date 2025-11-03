export default function BigCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* UBAH: Menggunakan 'neutral-800' dari config Anda */}
      <h2 className="text-xl font-semibold text-neutral-800 mb-4">{title}</h2>
      <div>{children}</div>
    </div>
  );
}