export async function getPublicVideoSignedUrl(videoId: string): Promise<string> {
  const res = await fetch(`/.netlify/functions/signed-url?videoId=${encodeURIComponent(videoId)}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Failed to get signed url")
  return json.url as string
}
