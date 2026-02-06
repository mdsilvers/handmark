'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function DashboardContent() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 mt-1">
            Welcome back! Here's an overview of your grading activity.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Classes</CardTitle>
              <div className="text-3xl font-bold text-purple-400">0</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignments</CardTitle>
              <div className="text-3xl font-bold text-purple-400">0</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Graded This Week</CardTitle>
              <div className="text-3xl font-bold text-purple-400">0</div>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with HandMark</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/classes">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-start">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-semibold">Create Your First Class</div>
                <div className="text-xs text-gray-400 mt-1">
                  Set up a class to start grading
                </div>
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-start" disabled>
              <div className="text-2xl mb-2">📝</div>
              <div className="font-semibold">Create Assignment</div>
              <div className="text-xs text-gray-400 mt-1">
                Add a new assignment to grade
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest grading sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-400">
              No activity yet. Create a class to get started!
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
