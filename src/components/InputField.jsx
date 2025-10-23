export default function InputField({ label, type, placeholder, required }) {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">
        {label}{required && " *"}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 border rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
