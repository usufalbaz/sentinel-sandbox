export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Sentinel Sandbox</h1>
      <p className="text-gray-400 text-center max-w-md">
        Paste a GitHub repo URL below to scan it for supply-chain RCE attack
        chains before running <code className="text-orange-400">npm install</code>.
      </p>
      {/* TODO: replace with <ScanForm /> component */}
      <div className="w-full max-w-lg rounded-lg border border-gray-700 bg-gray-900 p-6">
        <p className="text-gray-500 text-sm text-center">Scan form coming soon…</p>
      </div>
    </main>
  );
}
