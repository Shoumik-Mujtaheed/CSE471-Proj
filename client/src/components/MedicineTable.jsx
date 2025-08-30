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

  // Helper function to get stock status
  const getStockStatus = (medicine) => {
    if (medicine.quantity === 0) return { status: 'out-of-stock', color: '#dc3545', text: 'Out of Stock' };
    if (medicine.needsReorder) return { status: 'low-stock', color: '#ffc107', text: 'Low Stock' };
    return { status: 'in-stock', color: '#28a745', text: 'In Stock' };
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
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ccc" }}>
              Stock Status
            </th>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ccc" }}>
              Reorder Info
            </th>
            {editable && <th style={{ minWidth: 120 }} />}
          </tr>
        </thead>
        <tbody id="inventoryBody">
          {medicines.map((med) => {
            const stockStatus = getStockStatus(med);
            return (
              <tr key={med._id} style={{ 
                backgroundColor: med.needsReorder ? '#fff3cd' : 'transparent',
                borderLeft: med.needsReorder ? '4px solid #ffc107' : 'none'
              }}>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                  {med.name}
                </td>
                <td style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #eee" }}>
                  <span style={{ 
                    color: stockStatus.color, 
                    fontWeight: med.needsReorder ? 'bold' : 'normal' 
                  }}>
                    {med.quantity}
                  </span>
                </td>
                <td style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #eee" }}>
                  {med.price}tk
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                  <span style={{ 
                    color: stockStatus.color, 
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: stockStatus.color + '20',
                    fontSize: '12px'
                  }}>
                    {stockStatus.text}
                  </span>
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee", fontSize: '12px' }}>
                  {med.needsReorder && (
                    <div>
                      <div><strong>Threshold:</strong> {med.reorderThreshold}</div>
                      <div><strong>Order:</strong> {med.reorderQuantity}</div>
                      <div><strong>Supplier:</strong> {med.supplier}</div>
                    </div>
                  )}
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
            );
          })}
          {medicines.length === 0 && (
            <tr>
              <td colSpan={editable ? 6 : 5} style={{ textAlign: "center", padding: "16px" }}>
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
