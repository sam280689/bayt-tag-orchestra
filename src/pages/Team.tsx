import { TeamManagement } from "@/components/tagging/team-management"
import { MainNav } from "@/components/navigation/main-nav"

export default function Team() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto py-6">
        <TeamManagement />
      </main>
    </div>
  )
}