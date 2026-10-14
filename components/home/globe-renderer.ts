import {
  CatmullRomCurve3,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'

type Coordinate = [number, number]
type LandGeometry =
  | {type: 'Polygon'; coordinates: Coordinate[][]}
  | {type: 'MultiPolygon'; coordinates: Coordinate[][][]}
export type LandData = {features: Array<{geometry: LandGeometry | null}>}
type GlobeOptions = {
  speed: number
  smoothing: number
  direction: 'left' | 'right'
  scale: number
  dotColor: string
  dotOpacity: number
  density: number
  dotScale: number
  oceanColor: string
  showOutline: boolean
  outlineColor: string
  outlineWidth: number
  showGrid: boolean
  graticuleColor: string
  graticuleOpacity: number
  markers: Array<{lat: number; lng: number}>
  markerColor: string
  markerScale: number
  initialLatitude: number
  initialLongitude: number
  stopOnHover: boolean
  dragSpeed: number
}

const mapLinear = (value: number, a: number, b: number, c: number, d: number) => a === b ? c : c + ((value - a) / (b - a)) * (d - c)
const clamp = (value: number, a: number, b: number) => Math.max(a, Math.min(b, value))

function latLngToPosition(lat: number, lng: number) {
  const latitude = lat * Math.PI / 180
  const longitude = lng * Math.PI / 180
  return {
    x: Math.cos(latitude) * Math.sin(longitude),
    y: Math.sin(latitude),
    z: Math.cos(latitude) * Math.cos(longitude),
  }
}

function geometryPolygons(geometry: LandGeometry) {
  return geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
}

function buildLandMask(geo: LandData, width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', {willReadFrequently: true})
  if (!context) throw new Error('Canvas 2D is unavailable')

  context.fillStyle = '#000'
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#fff'
  context.beginPath()

  const px = (lng: number) => ((lng + 180) / 360) * width
  const py = (lat: number) => ((90 - lat) / 180) * height

  for (const feature of geo.features) {
    const geometry = feature.geometry
    if (!geometry) continue

    for (const polygon of geometryPolygons(geometry)) {
      for (const ring of polygon) {
        if (!ring || ring.length < 3) continue

        const unwrapped: Coordinate[] = []
        let previous: number | null = null
        let offset = 0

        for (const [lng, lat] of ring) {
          if (previous !== null) {
            const delta = lng - previous
            if (delta > 180) offset -= 360
            else if (delta < -180) offset += 360
          }
          unwrapped.push([lng + offset, lat])
          previous = lng
        }

        for (const shift of [-360, 0, 360]) {
          context.moveTo(px(unwrapped[0][0] + shift), py(unwrapped[0][1]))
          for (let index = 1; index < unwrapped.length; index += 1) {
            context.lineTo(px(unwrapped[index][0] + shift), py(unwrapped[index][1]))
          }
          context.closePath()
        }
      }
    }
  }

  context.fill()
  const pixels = context.getImageData(0, 0, width, height).data

  return (lng: number, lat: number) => {
    let x = Math.round(((lng + 180) / 360) * width) % width
    if (x < 0) x += width
    const y = clamp(Math.round(((90 - lat) / 180) * height), 0, height - 1)
    return pixels[(y * width + x) * 4] > 128
  }
}

export function initGlobe(container: HTMLDivElement, geo: LandData, options: Partial<GlobeOptions> = {}) {
  const config: GlobeOptions = {
    speed: 2,
    smoothing: 8,
    direction: 'left',
    scale: 8,
    dotColor: '#A8CFC4',
    dotOpacity: .92,
    density: 7,
    dotScale: .0075,
    oceanColor: '#0D3833',
    showOutline: false,
    outlineColor: '#2A7168',
    outlineWidth: 1,
    showGrid: false,
    graticuleColor: '#2A7168',
    graticuleOpacity: .5,
    markers: [],
    markerColor: '#C7DC6A',
    markerScale: .019,
    initialLatitude: 18,
    initialLongitude: -26,
    stopOnHover: true,
    dragSpeed: 5,
    ...options,
  }

  const initialWidth = container.clientWidth || 480
  const initialHeight = container.clientHeight || 480
  const scaleMultiplier = mapLinear(clamp(config.scale, 1, 20), 1, 20, .2, 2)
  const globeRadius = scaleMultiplier
  const cameraDistance = 2.5 / scaleMultiplier

  const scene = new Scene()
  const camera = new PerspectiveCamera(50, initialWidth / initialHeight, .1, 1e3)
  camera.position.set(0, 0, cameraDistance)
  camera.lookAt(0, 0, 0)

  const renderer = new WebGLRenderer({antialias: true, alpha: true})
  renderer.setSize(initialWidth, initialHeight)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.outputColorSpace = SRGBColorSpace
  const canvas = renderer.domElement
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
  container.appendChild(canvas)

  const globeGroup = new Group()
  scene.add(globeGroup)

  const ocean = new Mesh(
    new SphereGeometry(globeRadius, 64, 64),
    new MeshBasicMaterial({color: new Color(config.oceanColor)}),
  )
  globeGroup.add(ocean)

  const tube = (points: Vector3[], radius: number, material: MeshBasicMaterial, order = 0) => {
    if (points.length < 2) return null
    const mesh = new Mesh(new TubeGeometry(new CatmullRomCurve3(points), points.length * 2, radius, 8, false), material)
    mesh.renderOrder = order
    return mesh
  }

  if (config.showGrid) {
    const material = new MeshBasicMaterial({color: new Color(config.graticuleColor), transparent: true, opacity: config.graticuleOpacity})
    const group = new Group()
    const step = 15
    const radius = .001

    for (let lat = -90; lat <= 90; lat += step) {
      const points: Vector3[] = []
      for (let index = 0; index <= 64; index += 1) {
        const position = latLngToPosition(lat, (index / 64) * 360 - 180)
        points.push(new Vector3(position.x * globeRadius, position.y * globeRadius, position.z * globeRadius))
      }
      const line = tube(points, radius, material)
      if (line) group.add(line)
    }

    for (let lng = -180; lng < 180; lng += step) {
      const points: Vector3[] = []
      for (let index = 0; index <= 64; index += 1) {
        const position = latLngToPosition((index / 64) * 180 - 90, lng)
        points.push(new Vector3(position.x * globeRadius, position.y * globeRadius, position.z * globeRadius))
      }
      const line = tube(points, radius, material)
      if (line) group.add(line)
    }
    globeGroup.add(group)
  }

  if (config.showOutline) {
    const material = new MeshBasicMaterial({color: new Color(config.outlineColor)})
    const group = new Group()
    const radius = (config.outlineWidth / 10) * .01

    for (const feature of geo.features) {
      const geometry = feature.geometry
      if (!geometry) continue

      for (const polygon of geometryPolygons(geometry)) {
        const ring = polygon[0]
        if (!ring || ring.length < 3) continue
        const points = ring.map(([lng, lat]) => {
          const position = latLngToPosition(lat, lng)
          return new Vector3(position.x * globeRadius, position.y * globeRadius, position.z * globeRadius)
        })
        if (points[0].distanceTo(points[points.length - 1]) > .001) points.push(points[0].clone())
        const line = tube(points, radius, material)
        if (line) group.add(line)
      }
    }
    globeGroup.add(group)
  }

  const isLand = buildLandMask(geo, 2048, 1024)
  const step = mapLinear(clamp(config.density, 1, 10), 1, 10, 24, 8) * .08
  const coordinates: Coordinate[] = []

  for (let lat = -58; lat <= 84; lat += step) {
    const cosine = Math.cos(Math.abs(lat) * Math.PI / 180)
    const longitudeStep = cosine > .01 ? step / Math.max(.3, cosine) : 360
    for (let lng = -180; lng < 180; lng += longitudeStep) {
      if (isLand(lng, lat)) coordinates.push([lng, lat])
    }
  }

  if (coordinates.length) {
    const dots = new InstancedMesh(
      new SphereGeometry(globeRadius * config.dotScale, 5, 5),
      new MeshBasicMaterial({color: new Color(config.dotColor), transparent: config.dotOpacity < 1, opacity: config.dotOpacity}),
      coordinates.length,
    )
    const matrix = new Matrix4()

    coordinates.forEach(([lng, lat], index) => {
      const position = latLngToPosition(lat, lng)
      matrix.makeScale(1, 1, 1)
      matrix.setPosition(position.x * globeRadius, position.y * globeRadius, position.z * globeRadius)
      dots.setMatrixAt(index, matrix)
    })
    dots.instanceMatrix.needsUpdate = true
    globeGroup.add(dots)
  }

  const markerGeometry = new SphereGeometry(globeRadius * config.markerScale, 16, 16)
  const markerMaterial = new MeshBasicMaterial({color: new Color(config.markerColor)})

  for (const marker of config.markers) {
    const position = latLngToPosition(marker.lat, marker.lng)
    const radius = globeRadius * 1.012
    const mesh = new Mesh(markerGeometry, markerMaterial)
    mesh.position.set(position.x * radius, position.y * radius, position.z * radius)
    globeGroup.add(mesh)
  }

  const smoothing = clamp(config.smoothing / 10, 0, 1)
  const lerpFactor = smoothing === 0 ? 1 : mapLinear(smoothing, 0, 1, .4, .03)
  const velocityDecay = mapLinear(smoothing, 0, 1, .7, .96)
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const baseSpeed = reducedMotion ? 0 : mapLinear(clamp(config.speed, 0, 10), 0, 10, 0, .9)
  const rotationSpeed = config.direction === 'left' ? -baseSpeed : baseSpeed
  const rotation = {x: config.initialLongitude * Math.PI / 180, y: config.initialLatitude * Math.PI / 180}
  const target = {...rotation}
  const velocity = {x: 0, y: 0}
  globeGroup.rotation.y = rotation.x
  globeGroup.rotation.x = rotation.y

  let dragging = false
  let hovering = false
  let visible = true
  let animationFrame: number | null = null
  let lastX = 0
  let lastY = 0
  const threshold = 1e-4

  function frame() {
    if (!dragging && rotationSpeed !== 0 && (!config.stopOnHover || !hovering)) target.x += rotationSpeed * .01
    if (!dragging && smoothing > 0) {
      if (Math.abs(velocity.x) > threshold || Math.abs(velocity.y) > threshold) {
        target.x += velocity.x
        target.y += velocity.y
        target.y = clamp(target.y, -Math.PI / 2, Math.PI / 2)
        velocity.x *= velocityDecay
        velocity.y *= velocityDecay
      } else {
        velocity.x = 0
        velocity.y = 0
      }
    }

    const deltaX = target.x - rotation.x
    const deltaY = target.y - rotation.y
    rotation.x += deltaX * lerpFactor
    rotation.y += deltaY * lerpFactor
    rotation.y = clamp(rotation.y, -Math.PI / 2, Math.PI / 2)
    globeGroup.rotation.y = rotation.x
    globeGroup.rotation.x = rotation.y
    renderer.render(scene, camera)

    const busy = dragging || rotationSpeed !== 0
      || Math.abs(velocity.x) > threshold || Math.abs(velocity.y) > threshold
      || Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold
    animationFrame = busy && visible ? requestAnimationFrame(frame) : null
  }

  const start = () => {
    if (animationFrame === null && visible) animationFrame = requestAnimationFrame(frame)
  }

  const sensitivity = mapLinear(clamp(config.dragSpeed, 0, 10), 0, 10, .001, .02)
  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) return
    const deltaX = event.clientX - lastX
    const deltaY = event.clientY - lastY
    target.x += deltaX * sensitivity
    target.y += deltaY * sensitivity
    target.y = clamp(target.y, -Math.PI / 2, Math.PI / 2)
    velocity.x = deltaX * sensitivity * .3
    velocity.y = deltaY * sensitivity * .3
    lastX = event.clientX
    lastY = event.clientY
  }
  const onPointerUp = (event: PointerEvent) => {
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    dragging = false
    canvas.style.cursor = 'grab'
  }
  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return
    dragging = true
    velocity.x = 0
    velocity.y = 0
    lastX = event.clientX
    lastY = event.clientY
    canvas.style.cursor = 'grabbing'
    canvas.setPointerCapture(event.pointerId)
    start()
  }

  canvas.style.cursor = 'grab'
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)

  const raycaster = new Raycaster()
  const pointer = new Vector2()
  const onCanvasMouseMove = (event: MouseEvent) => {
    if (!config.stopOnHover) return
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const wasHovering = hovering
    hovering = raycaster.intersectObject(ocean).length > 0
    if (wasHovering && !hovering) start()
  }
  const onCanvasMouseLeave = () => {
    hovering = false
    start()
  }
  canvas.addEventListener('mousemove', onCanvasMouseMove)
  canvas.addEventListener('mouseleave', onCanvasMouseLeave)

  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth || initialWidth
    const height = container.clientHeight || initialHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    renderer.render(scene, camera)
  })
  resizeObserver.observe(container)

  const intersectionObserver = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting
    if (visible) start()
    else if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  }, {threshold: .01})
  intersectionObserver.observe(container)

  renderer.render(scene, camera)
  start()

  return () => {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerUp)
    canvas.removeEventListener('mousemove', onCanvasMouseMove)
    canvas.removeEventListener('mouseleave', onCanvasMouseLeave)
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return
      object.geometry.dispose()
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => material.dispose())
    })
    renderer.dispose()
    canvas.remove()
  }
}

