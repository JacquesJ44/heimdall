// components/Card.jsx
const Card = ({ title, value }) => (
  <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-2xl shadow text-center min-w-0">
    <div className="text-gray-500 text-sm">{title}</div>
    <div className="text-lg sm:text-xl font-semibold mt-1 break-words">{value}</div>
  </div>
);

export default Card;
