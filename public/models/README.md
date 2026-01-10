# 3D Models Directory

Place your 3D device models here for AR/WebXR visualization.

## Supported Formats

### glTF/GLB (Web-based AR)
- **Recommended**: GLB (binary glTF)
- **Use for**: WebXR, AR.js, Three.js
- **Naming**: `device.glb`, `pipe-sensor.glb`, etc.

### USDZ (iOS Quick Look)
- **Use for**: iOS AR Quick Look
- **Naming**: `device.usdz`

## Example Models

You can find free 3D models at:
- https://sketchfab.com/
- https://poly.google.com/
- https://www.cgtrader.com/

## Converting Models

Convert models to glTF/GLB:
```bash
# Install gltf-pipeline
npm install -g gltf-pipeline

# Convert OBJ to GLB
gltf-pipeline -i model.obj -o model.glb

# Optimize GLB
gltf-pipeline -i model.glb -o model-optimized.glb -d
```

Convert to USDZ (macOS only):
```bash
# Use Reality Converter (Apple)
# Or use command line:
xcrun usdz_converter input.obj output.usdz
```

## Model Guidelines

- **File size**: Keep under 5MB for web performance
- **Polygons**: Aim for 10k-50k triangles
- **Textures**: Use compressed formats (JPG for color, PNG for alpha)
- **Scale**: Use meters as units (1 unit = 1 meter)
- **Center**: Model should be centered at origin (0,0,0)

## Loading Models in Code

### Three.js (WebXR)
```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const loader = new GLTFLoader()
loader.load('/models/device.glb', (gltf) => {
  scene.add(gltf.scene)
})
```

### AR.js (Marker-based)
```html
<a-marker preset="hiro">
  <a-entity gltf-model="url(/models/device.glb)"></a-entity>
</a-marker>
```

### iOS Quick Look
```html
<a rel="ar" href="/models/device.usdz">
  <img src="/images/device-preview.jpg" />
  View in AR
</a>
```
