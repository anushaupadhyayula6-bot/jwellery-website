export default function SequenceLoader({ show }: { show: boolean }) {
  return <div className={`loader${show ? '' : ' done'}`} aria-hidden={!show}><span>ÉLARA</span><i /></div>
}
