export default function Card({ title, content }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* UBAH: Menggunakan text-neutral-800 */}
      <h3 className="text-lg font-semibold mb-2 text-neutral-800">{title}</h3>
      {content ? (
        // UBAH: Menggunakan text-primary-600
        <p className="text-3xl font-bold text-primary-600">{content}</p>
      ) : (
        // UBAH: Menggunakan bg-neutral-200
        <div className="h-20 bg-neutral-200 rounded-lg"></div> // Placeholder loading
      )}
    </div>
  );
}