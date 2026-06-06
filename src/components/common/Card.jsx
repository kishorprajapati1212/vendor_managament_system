export default function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
      <div className="p-3 bg-blue-100 text-blue-600 rounded-full">{icon}</div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}