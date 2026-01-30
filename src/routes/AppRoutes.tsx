import { Routes, Route } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import SearchPage from "@/pages/SearchPage"
import CreatorsListPage from "@/pages/CreatorsListPage"
import CreatorPublicPage from "@/pages/CreatorPublicPage"
import WatchPage from "@/pages/WatchPage"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />

      <Route path="/creators" element={<CreatorsListPage />} />
      <Route path="/c/:id" element={<CreatorPublicPage />} />
      <Route path="/watch/:id" element={<WatchPage />} />
    </Routes>
  )
}
