import React, { useEffect, useState } from "react";
import MedicineTable from "../components/MedicineTable.jsx";

function InventoryPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchMedicines();
    // eslint-disable-next-line
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("Failed to load inventory");
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      setError(err.message || "Error loading inventory.");
    }
    setLoading(false);
  };

  // Handler to add a medicine (calls backend then refetches)
  const handleAddMedicine = async (formData) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to add medicine");
      fetchMedicines();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handler to edit a medicine
  const handleEditMedicine = async (id, formData) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update medicine");
      fetchMedicines();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handler to delete a medicine
  const handleDeleteMedicine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete medicine");
      fetchMedicines();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handler after bulk upload
  const handleBulkUpload = () => {
    fetchMedicines();
  };

  // ---- UI ----

  return (
    <div className="inventory-page">
      <h1>Inventory - mediCore</h1>
      <button onClick={() => setEditMode((v) => !v)}>
        {editMode ? "Exit Edit Mode" : "Edit"}
      </button>
      {loading && <p>Loading inventory...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <MedicineTable
          medicines={medicines}
          editable={editMode}
          onAddMedicine={handleAddMedicine}
          onEditMedicine={handleEditMedicine}
          onDeleteMedicine={handleDeleteMedicine}
          onBulkUpload={handleBulkUpload}
        />
      )}
    </div>
  );
}

export default InventoryPage;
