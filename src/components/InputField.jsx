export default function InputField({ label, type, placeholder, required }) {
  return (
    <div className="mb-4">
      {/* UBAH: Menggunakan 'neutral-700' */}
      <label className="block text-neutral-700 font-medium mb-2">
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        /* UBAH: Menggunakan 'neutral-800', 'neutral-600', dan 'primary-500' */
        className="w-full px-4 py-2 border rounded-full text-neutral-800 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );
}