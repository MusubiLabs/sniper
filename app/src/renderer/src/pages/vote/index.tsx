import { useParams } from 'react-router-dom'

export default function VotePage() {
  const { id } = useParams()
  console.log(id)

  return <div>1231313 {id}</div>
}
