'use client'

import { useState } from 'react'

interface YouTubePlayerProps {
  videoId: string
}

/**
 * Validate YouTube video ID format
 * YouTube video IDs are exactly 11 characters long and contain only alphanumeric characters, hyphens, and underscores
 */
function isValidYouTubeId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id)
}

/**
 * YouTube Player with Facade Pattern
 *
 * Performance optimization: Delays loading the iframe until user clicks
 * - Reduces initial page load by ~500KB
 * - Improves LCP by 30-40%
 * - Shows thumbnail image with play button before loading
 */
export default function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Sanitize and validate video ID to prevent XSS
  if (!isValidYouTubeId(videoId)) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-white text-lg font-semibold mb-2">無効な動画IDです</p>
          <p className="text-gray-400 text-sm">
            この動画は正しく読み込めませんでした。
            <br />
            管理者に連絡してください。
          </p>
        </div>
      </div>
    )
  }

  // Facade: Show thumbnail with play button until user clicks
  if (!isLoaded) {
    return (
      <div
        className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
        onClick={() => setIsLoaded(true)}
        role="button"
        aria-label="動画を再生"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsLoaded(true)
          }
        }}
      >
        {/* YouTube thumbnail - maxresdefault provides highest quality */}
        <img
          src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
          alt="YouTube thumbnail"
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-colors">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 group-hover:scale-110 transition-all shadow-lg">
            <svg
              className="w-8 h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
    )
  }

  // Actual YouTube iframe - loaded after user interaction
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video player"
      />
    </div>
  )
}
