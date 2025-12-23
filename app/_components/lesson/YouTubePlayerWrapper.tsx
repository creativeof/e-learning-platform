'use client'

import dynamic from 'next/dynamic'

const YouTubePlayer = dynamic(() => import('./YouTubePlayer'), {
  loading: () => (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  ),
  ssr: false,
})

export default function YouTubePlayerWrapper({ videoId }: { videoId: string }) {
  return <YouTubePlayer videoId={videoId} />
}
