import ModelStage from './ModelStage'
import OpenBook from './OpenBook'
import VernierCaliper from './VernierCaliper'
import ExamPaper from './ExamPaper'
import GlbModel from './GlbModel'
import Telephone from './Telephone'
import MentorHand from './MentorHand'
import LectureHall from './LectureHall'
import CircuitLab from './CircuitLab'

interface Props {
  model: 'book' | 'caliper' | 'paper' | 'person' | 'prism' | 'island' | 'map' | 'phone' | 'hall' | 'mentor' | 'circuit'
  className?: string
  stageHeight?: string
  cameraPosition?: [number, number, number]
  fov?: number
  hoverRef?: React.MutableRefObject<boolean>
  graded?: boolean
  animate?: boolean
}

const LABELS: Record<Props['model'], string> = {
  book: 'Open physics book',
  caliper: 'Vernier caliper measuring a specimen',
  paper: 'Graded exam paper',
  person: 'Walking physics tutor figure',
  prism: 'Glass prism splitting a light beam',
  island: 'Study island with books',
  map: 'Sri Lanka map',
  phone: 'Ringing desk telephone — hover to answer',
  hall: 'Lecture hall with seated students',
  mentor: 'Senior students pulling a new student up',
  circuit: 'Interactive circuit board with energy pulses lighting an LED',
}

/** Compact auto-rotating 3D accent for sub-page heroes — much smaller than the main scenes.
 *  Each page passes its own context-matching model; nothing is reused page-to-page. */
export default function MiniModel({ model, className = '', stageHeight, cameraPosition = [0, 0.4, 4.2], fov = 40, hoverRef, graded, animate }: Props) {
  return (
    <ModelStage
      className={className}
      height={stageHeight}
      cameraPosition={cameraPosition}
      fov={fov}
      ariaLabel={LABELS[model]}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 4]} intensity={1.5} color="#cfe4ff" />
      <pointLight position={[-3, 1, 2]} intensity={12} color="#38e8ff" distance={14} />
      {model === 'book' && <OpenBook hoverRef={hoverRef ?? { current: false }} />}
      {model === 'caliper' && <VernierCaliper animate={animate} />}
      {model === 'paper' && <ExamPaper trigger={graded ? 1 : 0} />}
      {model === 'person' && <GlbModel src="/models/person.glb" height={2.3} playAnimation />}
      {model === 'prism' && <GlbModel src="/models/prism.glb" height={1.7} speed={0.35} />}
      {model === 'island' && <GlbModel src="/models/study-island.glb" height={2.1} speed={0.3} />}
      {model === 'map' && <GlbModel src="/models/sri-lanka.glb" height={2.2} speed={0.25} brighten={0.5} />}
      {model === 'phone' && <Telephone />}
      {model === 'hall' && <LectureHall />}
      {model === 'mentor' && <MentorHand />}
      {model === 'circuit' && <CircuitLab />}
    </ModelStage>
  )
}
