import ItemCard from "./ItemCard";
import type { Item } from "./ItemCard";

type ItemListProps = {
  items: Item[];
  onDelete: (id: number) => void;
};

function ItemList({ items, onDelete }: ItemListProps) {
  return (
    <div className="list">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  );
}
export default ItemList;