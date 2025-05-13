import { useState } from "react";

const ActionDropdown = ({ onActionSelect }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (action) => {
    setOpen(false);
    onActionSelect(action);
  };

  return (
    <div className="relative inline-block text-right">
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex justify-center w-full px-3 py-2 text-sm font-medium bg-white rounded-md shadow"
        >
          Actions ▾
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={() => handleSelect("services")}
              className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
            >
              All Services
            </button>

            <button
              onClick={() => handleSelect("po_current_month")}
              className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100"
            >
              PO - Current Month
            </button>

            <button onClick={() => handleSelect("prorata")} className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100">
              Prorata
            </button>

            <button onClick={() => handleSelect("fluent_living")} className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100">
              Fluent Living
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
