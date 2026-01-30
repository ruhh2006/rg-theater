import { Link } from "react-router-dom"

type Props = {
  id: string
  display_name: string
  avatar_url: string | null
}

export default function CreatorCard({ id, display_name, avatar_url }: Props) {
  return (
    <Link to={`/c/${id}`} className="group shrink-0 w-[160px] md:w-[180px]">
      <div className="aspect-square rounded-xl overflow-hidden bg-neutral-900 shadow">
        <img
          src={avatar_url || "/avatar.png"}
          alt={display_name}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      </div>
      <p className="mt-2 text-center text-sm text-gray-200 line-clamp-1">{display_name}</p>
    </Link>
  )
}
