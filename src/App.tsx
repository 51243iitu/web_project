import { useState } from 'react';
import Header from './components/Header';
import ItemForm from './components/ItemForm';
import ItemList from './components/ItemList';
import type { Item } from './components/ItemCard';
import './App.css';

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');

  function addItem(name: string) {
    setItems([...items, { id: Date.now(), name }]);
  }

  function deleteItem(id: number) {
    setItems(items.filter((i) => i.id !== id));
  }

  const shown = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <Header title="Inclusive Learning" />
      <input
        className="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <ItemForm onAdd={addItem} />
      <ItemList items={shown} onDelete={deleteItem} />
    </div>
  );
}
export default App;
