import ModelStage from './ModelStage'
import OpenBook from './OpenBook'
import VernierCaliper from './VernierCaliper'
import ExamPaper from './ExamPaper'

interface Props {
  model: 'book' | 'caliper' | 'paper'
  className?: string
  stageHeight?: string
  cameraPosition?: [number, number, number]
  fov?: number
  hoverRef?: React.MutableRefObject<boolean>
  graded?: boolean
  animate?: boolean
}

/** Compact auto-rotating 3D accent for sub-page heroes — much smaller than the main scenes. */
export default function MiniModel({ model, className = '', stageHeight, cameraPosition = [0, 0.4, 4.2], fov = 40, hoverRef, graded, animate }: Props) {
  return (
    <ModelStage
      className={className}
      height={stageHeight}
      cameraPosition={cameraPosition}
      fov={fov}
      ariaLabel={model === 'book' ? 'Open physics book' : model === 'caliper' ? 'Vernier caliper measuring a specimen' : 'Graded exam paper'}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 4]} intensity={1.5} color="#cfe4ff" />
      <pointLight position={[-3, 1, 2]} intensity={12} color="#38e8ff" distance={14} />
      {model === 'book' && <OpenBook hoverRef={hoverRef ?? { current: false }} />}
      {model === 'caliper' && <VernierCaliper animate={animate} />}
      {model === 'paper' && <ExamPaper trigger={graded ? 1 : 0} />}
    </ModelStage>
  )
}
