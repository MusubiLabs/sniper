import { useParams } from 'react-router-dom'
import VoteList from './vote-list'

export default function VotePage() {
  const { id } = useParams()
  console.log(id)

  return( VoteList({ data: { id } }) )
}
