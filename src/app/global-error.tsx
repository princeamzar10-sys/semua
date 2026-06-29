'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-400 mb-4">{error.message}</p>
          <button onClick={reset} className="px-4 py-2 bg-black text-white rounded-xl text-sm">
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
