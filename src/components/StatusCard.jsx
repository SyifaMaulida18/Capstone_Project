const StatusCard = ({ title, value }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-indigo-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
      <p className="text-4xl font-extrabold text-indigo-600 mt-2">{value}</p>
    </div>
  );
};

export default StatusCard;