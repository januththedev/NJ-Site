import ModelStage from './ModelStage'
import StudyIsland from './StudyIsland'
import PrismScene from './PrismScene'

interface Props {
  model: 'island' | 'prism'
  className?: string
  cameraPosition?: [number, number, number]
  fov?: number
  modelY?: number
  modelScale?: number
  speed?: number
}

/** Compact auto-rotating 3D accent for sub-page heroes — much smaller than the main hero. */
export default function MiniModel({ model, className = '', cameraPosition = [0, 0.6, 5.2], fov = 40, modelY = -0.4, modelScale = 0.9, speed = 1 }: Props) {
  return (
    <ModelStage className={className} cameraPosition={cameraPosition} fov={fov} ariaLabel={model === 'island' ? 'Floating physics study island' : 'Optics prism splitting light into a spectrum'}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} color="#cfe4ff" />
      <pointLight position={[-3, 1, 2]} intensity={12} color="#38e8ff" distance={14} />
      {model === 'island' ? (
        <StudyIsland position={[0, modelY, 0]} scale={modelScale} />
      ) : (
        <PrismScene position={[0, modelY, 0]} scale={modelScale} speed={speed} />
      )}
    </ModelStage>
  )
}
