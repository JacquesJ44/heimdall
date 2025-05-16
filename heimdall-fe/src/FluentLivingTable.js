// components/UnitTable.jsx
const FluentLivingTable = ({ units }) => (
  <div className="mt-4 overflow-x-auto">
    <table className="min-w-full bg-white dark:bg-gray-900 rounded-2xl shadow">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-900 text-left">
          <th className="p-3">Unit</th>
          <th className="p-3">Owner</th>
          <th className="p-3">SSID 2.4GHz</th>
          <th className="p-3">Password 2.4GHz</th>
          <th className="p-3">SSID 5GHz</th>
          <th className="p-3">Password 5GHz</th>
          <th className="p-3">Package</th>
        </tr>
      </thead>
      <tbody>
        {units.map((unit, idx) => (
          <tr key={idx} className="border-t">
            <td className="p-3">{unit.unit_number}</td>
            <td className="p-3">{unit.customer_fullname}</td>
            <td className="p-3">{unit.ssid_24ghz}</td>
            <td className="p-3">{unit.password_24ghz}</td>
            <td className="p-3">{unit.ssid_5ghz}</td>
            <td className="p-3">{unit.password_24ghz}</td>
            <td className="p-3">{unit.package}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default FluentLivingTable;