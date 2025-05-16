const ProRataTable = ({ data }) => {

  // This function converts the string 'totalAmount' to an integer
  const totalAmount = data.reduce((acc, row) => {
  const clean = typeof row.total === "string" ? row.total.replace(/[^\d.-]/g, "") : row.total;
  const parsed = parseFloat(clean) || 0;
  return acc + parsed;
}, 0);

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-900 rounded-2xl shadow">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-900 text-left">
            <th className="p-3">Unit</th>
            <th className="p-3">Package</th>
            <th className="p-3">Cost per Service</th>
            <th className="p-3">Activation Date</th>
            <th className="p-3">Active Days</th>
            <th className="p-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-3">{row.unit}</td>
              <td className="p-3">{row.package}</td>
              <td className="p-3">R {row.cost_price}</td>
              <td className="p-3">{row.activation_date}</td>
              <td className="p-3">{row.active_days}</td>
              <td className="p-3">R {row.prorata_amount.toFixed(2)}</td>
            </tr>
          ))}
          {/* <tr className="border-t font-semibold bg-gray-50">
            <td className="p-3" colSpan="3">Total</td>
            <td className="p-3">R {totalAmount.toFixed(2)}</td>
          </tr> */}
        </tbody>
      </table>
    </div>
  );
};

export default ProRataTable;