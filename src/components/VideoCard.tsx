import { Link } from "react-router-dom"

type Props = {
  id: string
  title: string
  thumbnail_url: string
}

export default function VideoCard({ id, title, thumbnail_url }: Props) {
  return (
    <Link to={`/watch/${id}`} className="group shrink-0 w-[220px] md:w-[260px]">
      <div className="aspect-video rounded-lg overflow-hidden bg-neutral-900 shadow">
        <img
          src={thumbnail_url}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      </div>
      <p className="mt-2 text-sm text-gray-200 line-clamp-2">{title}</p>
    </Link>
  )
}
