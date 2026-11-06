import { useState } from "react";

type ItemFormProps = { onAdd: (name: string) => void };

function ItemForm({ onAdd }: ItemFormProps) {
  const [name, setName] = useState("");

  function handleSubmit() {
    if (name.trim() === "") return;
    onAdd(name);
    setName("");
  }

  return (
    <div className="form">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New item"
      />
      <button onClick={handleSubmit}>Add</button>
    </div>
  );
}
export default ItemForm;