import React, { useState, useEffect } from "react";

// onSubmit gets {name, price, quantity}
// initialValues: {name, price, quantity}
function MedicineForm({ open, onClose, onSubmit, initialValues = {}, mode = "add" }) {
  const [form, setForm] = useState({ name: "", price: "", quantity: "" });

  useEffect(() => {
    if (open) {
      setForm({
        name: initialValues.name || "",
        price: initialValues.price || "",
        quantity: initialValues.quantity || "",
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
    onSubmit({ ...form, price: Number(form.price), quantity: Number(form.quantity) || 0 });
  };

  if (!open) return null;
  return (
    <div className="modal-bg">
      <div className="modal">
        <h2>{mode === "edit" ? "Edit Medicine" : "Add Medicine"}</h2>
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
          <button type="submit">{mode === "edit" ? "Save" : "Add"}</button>
        </form>
        <button onClick={onClose} style={{ marginTop: 10 }}>Close</button>
      </div>
    </div>
  );
}

export default MedicineForm;
