import PartyHeader from './party-header'
import PartyList from './party-list'

export default function PartyPage() {
  return (
    <article className="flex flex-col p-8 gap-4">
      <PartyHeader />
      <PartyList />
    </article>
  )
}
