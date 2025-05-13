// components/Card.jsx
const Card = ({ title, value }) => (
  <div className="bg-white p-4 rounded-2xl shadow text-center">
    <div className="text-gray-500 text-sm">{title}</div>
    <div className="text-xl font-semibold mt-1">{value}</div>
  </div>
);

export default Card;
