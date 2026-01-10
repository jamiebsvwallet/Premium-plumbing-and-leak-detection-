import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ARDiagnostics() {
  const router = useRouter();
  const { deviceId } = router.query;
  const [supportsAR, setSupportsAR] = useState(false);
  const [arMode, setArMode] = useState<'webxr' | 'arjs' | 'quicklook' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check for WebXR support
    if ('xr' in navigator) {
      (navigator as any).xr.isSessionSupported('immersive-ar').then((supported: boolean) => {
        if (supported) {
          setSupportsAR(true);
          setArMode('webxr');
        } else {
          checkFallbacks();
        }
      }).catch(() => {
        checkFallbacks();
      });
    } else {
      checkFallbacks();
    }
  }, []);

  const checkFallbacks = () => {
    // Check for iOS Quick Look
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setSupportsAR(true);
      setArMode('quicklook');
    } else {
      // Use AR.js marker-based AR as fallback
      setSupportsAR(true);
      setArMode('arjs');
    }
  };

  const startWebXRSession = async () => {
    if (!('xr' in navigator)) {
      alert('WebXR is not supported on this device');
      return;
    }

    try {
      const session = await (navigator as any).xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
      });

      // WebXR session setup would go here
      // This is a simplified version - full implementation would include:
      // - Reference space setup
      // - Hit testing for surface placement
      // - 3D model rendering with Three.js
      // - Real-time data overlay

      alert('WebXR session started! (Full implementation requires Three.js WebXR integration)');
      
      session.addEventListener('end', () => {
        console.log('AR session ended');
      });
    } catch (error) {
      console.error('Failed to start AR session:', error);
      alert('Failed to start AR session. Please check device permissions.');
    }
  };

  const startARjsSession = () => {
    // AR.js marker-based AR
    // In a full implementation, this would initialize AR.js with a marker pattern
    alert('AR.js marker-based AR would start here. Point your camera at a Hiro marker.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">AR Diagnostics</h1>
            <div className="flex gap-4">
              <Link
                href={`/digital-twin/${deviceId}`}
                className="text-blue-600 hover:text-blue-700"
              >
                Open Digital Twin
              </Link>
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Augmented Reality Diagnostics
            </h2>
            <p className="text-gray-600 mb-6">
              View your device data overlaid on the real world. Use AR to visualize leak detection
              data, flow rates, and system status in your physical space.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Device:</strong> {deviceId}
              </p>
              <p className="text-sm text-blue-900 mt-1">
                <strong>AR Mode:</strong> {arMode || 'Detecting...'}
              </p>
              <p className="text-sm text-blue-900 mt-1">
                <strong>Status:</strong> {supportsAR ? 'AR Supported ✓' : 'Checking...'}
              </p>
            </div>

            {/* WebXR (Android, some browsers) */}
            {arMode === 'webxr' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-bold text-green-900 mb-2">✓ WebXR AR Supported</h3>
                  <p className="text-sm text-green-800 mb-4">
                    Your device supports native WebXR augmented reality. Click below to launch the
                    AR experience.
                  </p>
                  <button
                    onClick={startWebXRSession}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    Launch WebXR AR
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-2">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>Grant camera permissions when prompted</li>
                    <li>Move your device to scan for surfaces</li>
                    <li>Tap to place the device visualization</li>
                    <li>View real-time data overlaid on the AR scene</li>
                  </ol>
                </div>
              </div>
            )}

            {/* iOS Quick Look */}
            {arMode === 'quicklook' && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="font-bold text-purple-900 mb-2">📱 iOS Quick Look AR</h3>
                  <p className="text-sm text-purple-800 mb-4">
                    Your iOS device supports AR Quick Look. Download or view the USDZ model to see
                    the device in AR.
                  </p>
                  <a
                    href="/models/leak-detector.usdz"
                    rel="ar"
                    className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                  >
                    View in AR (Quick Look)
                  </a>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> iOS Quick Look will open the device model in AR. You can
                    place it in your space, scale it, and view it from different angles.
                  </p>
                </div>
              </div>
            )}

            {/* AR.js Marker-based fallback */}
            {arMode === 'arjs' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="font-bold text-yellow-900 mb-2">🎯 Marker-based AR (AR.js)</h3>
                  <p className="text-sm text-yellow-800 mb-4">
                    Using marker-based AR as a fallback. Print or display a Hiro marker and point
                    your camera at it to see the AR visualization.
                  </p>
                  <button
                    onClick={startARjsSession}
                    className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition"
                  >
                    Start Marker-based AR
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-2">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>
                      Download and print a{' '}
                      <a
                        href="https://github.com/AR-js-org/AR.js/blob/master/data/images/hiro.png"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Hiro marker
                      </a>
                    </li>
                    <li>Grant camera permissions when prompted</li>
                    <li>Point your camera at the marker</li>
                    <li>The device visualization will appear on the marker</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Demo Video/Canvas */}
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">AR Preview</h3>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative">
              <video ref={videoRef} className="hidden" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="text-center text-white">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-xl mb-2">AR Experience Preview</p>
                <p className="text-sm opacity-75">
                  Launch AR mode above to see device diagnostics in augmented reality
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">About AR Diagnostics</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                • <strong>Real-time Data:</strong> View live flow rates, pressure, and temperature
                overlaid on your device
              </p>
              <p>
                • <strong>Alert Visualization:</strong> Color-coded alerts help identify issues
                quickly
              </p>
              <p>
                • <strong>3D Models:</strong> Accurate 3D representations help with device
                identification
              </p>
              <p>
                • <strong>Cross-platform:</strong> Works on iOS (Quick Look), Android (WebXR), and
                desktop (marker-based)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
