import { ReactNode, useRef } from "react"

export default function Row({
  title,
  children,
  seeAllHref,
}: {
  title: string
  children: ReactNode
  seeAllHref?: string
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  function scrollBy(px: number) {
    scrollerRef.current?.scrollBy({ left: px, behavior: "smooth" })
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between px-6 md:px-10">
        <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
        {seeAllHref ? (
          <a href={seeAllHref} className="text-sm text-gray-300 hover:text-white">
            See all
          </a>
        ) : (
          <div />
        )}
      </div>

      <div className="relative mt-4">
        {/* left */}
        <button
          onClick={() => scrollBy(-700)}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10
                     w-10 h-10 rounded-full bg-black/60 hover:bg-black/80
                     items-center justify-center text-white"
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div
          ref={scrollerRef}
          className="px-6 md:px-10 flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {children}
        </div>

        {/* right */}
        <button
          onClick={() => scrollBy(700)}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10
                     w-10 h-10 rounded-full bg-black/60 hover:bg-black/80
                     items-center justify-center text-white"
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </div>
  )
}
