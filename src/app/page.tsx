export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-100">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-6xl font-bold tracking-tight sm:text-7xl">
            Voice Dictation
          </h1>
          <p className="max-w-[700px] text-lg text-slate-400 sm:text-xl">
            Turn your speech into polished text with AI-powered editing
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-slate-700 bg-slate-800 p-6">
            <div className="rounded-full bg-blue-500 p-4">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 013-3h4a3 3 0 013 3v4a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Hold to Record</h2>
            <p className="text-center text-sm text-slate-400">
              Press and hold Cmd+Shift+V to start recording
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg border border-slate-700 bg-slate-800 p-6">
            <div className="rounded-full bg-green-500 p-4">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">AI Powered</h2>
            <p className="text-center text-sm text-slate-400">
              Intelligent editing removes filler words and fixes stuttering
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
          <p>Press <kbd className="rounded bg-slate-700 px-2 py-1">Cmd</kbd> + <kbd className="rounded bg-slate-700 px-2 py-1">Shift</kbd> + <kbd className="rounded bg-slate-700 px-2 py-1">V</kbd> to start recording</p>
          <p>Add <kbd className="rounded bg-slate-700 px-2 py-1">Space</kbd> for toggle mode</p>
        </div>
      </div>
    </main>
  )
}
