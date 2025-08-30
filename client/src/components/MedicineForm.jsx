import React, { useState, useEffect } from "react";

// onSubmit gets {name, price, quantity, reorderThreshold, reorderQuantity, supplier}
// initialValues: {name, price, quantity, reorderThreshold, reorderQuantity, supplier}
function MedicineForm({ open, onClose, onSubmit, initialValues = {}, mode = "add" }) {
  const [form, setForm] = useState({ 
    name: "", 
    price: "", 
    quantity: "",
    reorderThreshold: "",
    reorderQuantity: "",
    supplier: ""
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: initialValues.name || "",
        price: initialValues.price || "",
        quantity: initialValues.quantity || "",
        reorderThreshold: initialValues.reorderThreshold || "10",
        reorderQuantity: initialValues.reorderQuantity || "50",
        supplier: initialValues.supplier || "Default Supplier"
      });
    }
 }, [open, initialValues && initialValues._id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    onSubmit({ 
      ...form, 
      price: Number(form.price), 
      quantity: Number(form.quantity) || 0,
      reorderThreshold: Number(form.reorderThreshold) || 10,
      reorderQuantity: Number(form.reorderQuantity) || 50
    });
  };

  if (!open) return null;
  return (
    <div className="modal-bg">
      <div className="modal">
        <h2>{mode === "edit" ? "Edit Medicine - mediCore" : "Add Medicine - mediCore"}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name: </label>
            <input name="name" type="text" required value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label>Price (tk): </label>
            <input name="price" type="number" min={0} required value={form.price} onChange={handleChange} />
          </div>
          <div>
            <label>Quantity: </label>
            <input name="quantity" type="number" min={0} value={form.quantity} onChange={handleChange} />
          </div>
          <div>
            <label>Reorder Threshold: </label>
            <input 
              name="reorderThreshold" 
              type="number" 
              min={0} 
              value={form.reorderThreshold} 
              onChange={handleChange}
              title="Alert when stock falls below this number"
            />
          </div>
          <div>
            <label>Reorder Quantity: </label>
            <input 
              name="reorderQuantity" 
              type="number" 
              min={1} 
              value={form.reorderQuantity} 
              onChange={handleChange}
              title="How much to order when stock is low"
            />
          </div>
          <div>
            <label>Supplier: </label>
            <input 
              name="supplier" 
              type="text" 
              value={form.supplier} 
              onChange={handleChange}
              placeholder="Default Supplier"
            />
          </div>
          <button type="submit">{mode === "edit" ? "Save" : "Add"}</button>
        </form>
        <button onClick={onClose} style={{ marginTop: 10 }}>Close</button>
      </div>
    </div>
  );
}

export default MedicineForm;
