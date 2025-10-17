export default function Card({ title, content }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {content ? (
        <p className="text-3xl font-bold text-blue-600">{content}</p>
      ) : (
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      )}
    </div>
  );
}