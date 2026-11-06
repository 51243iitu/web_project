export type Item = { id: number; name: string };

type ItemCardProps = {
  item: Item;
  onDelete: (id: number) => void;
};

function ItemCard({ item, onDelete }: ItemCardProps) {
  return (
    <div className="card">
      <h3>{item.name}</h3>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  );
}
export default ItemCard;