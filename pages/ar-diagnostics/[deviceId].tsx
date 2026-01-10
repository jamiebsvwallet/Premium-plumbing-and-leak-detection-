import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function ARDiagnostics() {
  const router = useRouter()
  const { deviceId } = router.query
  const [device, setDevice] = useState<any>(null)
  const [arSupported, setArSupported] = useState(false)

  useEffect(() => {
    // Check WebXR support
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setArSupported(supported)
      })
    }
  }, [])

  if (!deviceId) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">AR Diagnostics</h1>
              <p className="text-gray-600 dark:text-gray-400">Device: {deviceId}</p>
            </div>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">WebXR AR</h2>
            <div className="mb-4">
              <p className="mb-2">
                Status: <span className={arSupported ? 'text-green-600' : 'text-red-600'}>
                  {arSupported ? 'Supported' : 'Not Supported'}
                </span>
              </p>
            </div>
            {arSupported ? (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Your device supports WebXR AR! Click the button below to launch the AR experience.
                </p>
                <button
                  onClick={() => alert('WebXR AR session would start here. Implementation requires device-specific setup.')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold"
                >
                  Launch WebXR AR
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  WebXR AR is not supported on this device. Try opening this page on:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  <li>Android device with Chrome or Edge</li>
                  <li>iOS device with Safari (AR Quick Look)</li>
                  <li>Meta Quest browser</li>
                </ul>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">AR.js Marker-Based</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Fallback AR experience using AR.js with marker tracking.
            </p>
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-sm text-gray-500">AR.js camera view placeholder</p>
                </div>
              </div>
              <button
                onClick={() => alert('AR.js marker-based AR would start here')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold"
              >
                Launch Marker AR
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">3D Model Preview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">glTF Model (Android/Web)</h3>
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-6xl mb-2">📦</div>
                  <p className="text-sm text-gray-500">glTF placeholder</p>
                </div>
              </div>
              <a
                href="/models/device-placeholder.glb"
                download
                className="block w-full text-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Download glTF
              </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">USDZ Model (iOS)</h3>
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-6xl mb-2">🍎</div>
                  <p className="text-sm text-gray-500">USDZ placeholder</p>
                </div>
              </div>
              <a
                href="/models/device-placeholder.usdz"
                download
                rel="ar"
                className="block w-full text-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Download USDZ
              </a>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📖 Instructions</h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold mb-1">For WebXR (Android Chrome/Edge):</h3>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Click "Launch WebXR AR"</li>
                <li>Grant camera permissions</li>
                <li>Point at a flat surface to place the device model</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-1">For iOS AR Quick Look:</h3>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Click "Download USDZ"</li>
                <li>Tap the AR icon that appears</li>
                <li>Point camera at surface to place model</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-1">For AR.js Marker-Based:</h3>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Print the AR marker (Hiro pattern)</li>
                <li>Click "Launch Marker AR"</li>
                <li>Point camera at the printed marker</li>
              </ol>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded">
              <p className="font-semibold mb-2">🔧 Replacing Assets:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Replace glTF: Place your model at <code>/public/models/device-placeholder.glb</code></li>
                <li>Replace USDZ: Place your model at <code>/public/models/device-placeholder.usdz</code></li>
                <li>Ensure models are optimized for mobile ({"<"}5MB recommended)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
