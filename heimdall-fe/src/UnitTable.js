// components/UnitTable.jsx
const UnitTable = ({ units }) => (
  <div className="mt-4 overflow-x-auto">
    <table className="min-w-full bg-white dark:bg-gray-900 rounded-2xl shadow">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-900 text-left">
          <th className="p-3">Unit</th>
          <th className="p-3">Package</th>
          <th className="p-3">Amount</th>
          <th className="p-3">Activation Date</th>
        </tr>
      </thead>
      <tbody>
        {units.map((unit, idx) => (
          <tr key={idx} className="border-t">
            <td className="p-3">{unit.unit_number}</td>
            {/* <td className="p-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                unit.status === "Active" ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"
              }`}>
                {unit.status}
              </span>
            </td> */}
            <td className="p-3">{unit.package}</td>
            <td className="p-3">R{unit.cost_price}</td>
            <td className="p-3">{unit.activation_date ? new Date(unit.activation_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                                                                                : 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default UnitTable;
