'use client'

interface YouTubePlayerProps {
  videoId: string
}

export default function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title="YouTube video player"
      />
    </div>
  )
}
