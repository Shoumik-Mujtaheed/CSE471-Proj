// components/MedicineTable.jsx

import React, { useState } from "react";
import MedicineForm from "./MedicineForm.jsx";
import BulkUploadModal from "./BulkUploadModal.jsx";

function MedicineTable({
  medicines = [],
  editable = false,                // Are we in edit/admin mode?
  onAddMedicine,                   // (medicineData) => Promise
  onEditMedicine,                  // (id, updatedData) => Promise
  onDeleteMedicine,                // (id) => Promise
  onBulkUpload                     // (success callback after upload)
}) {
  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null); // medicine object or null
  const [showBulk, setShowBulk] = useState(false);

  // Called after any add/edit/upload to close modals & refetch in parent
  const handleSuccess = () => {
    setShowAdd(false);
    setShowEdit(null);
    setShowBulk(false);
    onBulkUpload && onBulkUpload();
  };

  return (
    <div>
      {editable && (
        <div style={{ margin: "12px 0" }}>
          <button onClick={() => setShowAdd(true)} style={{ marginRight: 8 }}>
            Add Medicine
          </button>
          <button onClick={() => setShowBulk(true)}>
            Add medicines (CSV)
          </button>
        </div>
      )}

      <table className="inventory-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ccc" }}>
              Name
            </th>
            <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #ccc" }}>
              Quantity
            </th>
            <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #ccc" }}>
              Price
            </th>
            {editable && <th style={{ minWidth: 120 }} />}
          </tr>
        </thead>
        <tbody>
          {medicines.map((med) => (
            <tr key={med._id}>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                {med.name}
              </td>
              <td style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #eee" }}>
                {med.quantity}
              </td>
              <td style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #eee" }}>
                {med.price}tk
              </td>
              {editable && (
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                  <button
                    style={{ marginRight: 4 }}
                    onClick={() => setShowEdit(med)}
                  >
                    Change
                  </button>
                  <button
                    style={{ color: "red" }}
                    onClick={() => {
                      if (
                        window.confirm("Are you sure you want to delete this medicine?")
                      ) {
                        onDeleteMedicine && onDeleteMedicine(med._id);
                      }
                    }}
                  >
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
          {medicines.length === 0 && (
            <tr>
              <td colSpan={editable ? 4 : 3} style={{ textAlign: "center", padding: "16px" }}>
                No medicines in inventory.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add Medicine Modal */}
      <MedicineForm
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={onAddMedicine}
        mode="add"
      />

      {/* Edit Medicine Modal */}
      <MedicineForm
        open={!!showEdit}
        onClose={() => setShowEdit(null)}
        onSubmit={(data) => showEdit && onEditMedicine(showEdit._id, data)}
        initialValues={showEdit || {}}
        mode="edit"
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={showBulk}
        onClose={() => setShowBulk(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

export default MedicineTable;
