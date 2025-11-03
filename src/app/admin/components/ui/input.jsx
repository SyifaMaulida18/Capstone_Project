export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none px-3 py-2 ${className}`}
    />
  );
}
