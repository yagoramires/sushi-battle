import { MdAdd, MdRemove } from 'react-icons/md';

export default function FoodCard({ item, count, onAdd, onRemove }) {
  return (
    <li className="w-full bg-zinc-900 shadow-md rounded-md border-zinc-100 p-4 flex items-center overflow-hidden justify-between px-4">
      <div className="flex items-center gap-4">
        <p className="font-medium text-sm">{item.name}</p>
      </div>

      <div className="flex items-center gap-4">
        <MdRemove
          className="bg-zinc-600 rounded-full cursor-pointer"
          onClick={onRemove}
          size={20}
        />
        <p className="font-bold w-[30px] text-center">{count || 0}</p>
        <MdAdd
          className="bg-zinc-600 rounded-full cursor-pointer"
          onClick={onAdd}
          size={20}
        />
      </div>
    </li>
  );
}
