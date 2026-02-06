'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

function DashboardContent() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-[#0F0D15]">
      {/* Temporary Header */}
      <header className="bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              ✋ <span className="text-purple-500">Hand</span>Mark
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-white">
                {user?.email}
              </div>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-white space-y-4">
          <h2 className="text-3xl font-bold">Welcome to HandMark! 🎉</h2>
          <p className="text-gray-400">
            Authentication is working! The dashboard is under construction.
          </p>
          <p className="text-sm text-gray-500">
            Coming soon: Classes, Assignments, and AI-powered grading
          </p>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
