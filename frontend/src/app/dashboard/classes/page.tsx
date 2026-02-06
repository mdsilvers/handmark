'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface Class {
  id: string
  name: string
  gradeLevel: string
  subject: string
  studentCount: number
}

function ClassesContent() {
  const [classes, setClasses] = useState<Class[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newClass, setNewClass] = useState({
    name: '',
    gradeLevel: '',
    subject: '',
  })

  const handleCreateClass = () => {
    if (!newClass.name || !newClass.gradeLevel || !newClass.subject) {
      alert('Please fill in all fields')
      return
    }

    const classObj: Class = {
      id: Date.now().toString(),
      ...newClass,
      studentCount: 0,
    }

    setClasses([...classes, classObj])
    setNewClass({ name: '', gradeLevel: '', subject: '' })
    setIsCreateModalOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Classes</h2>
            <p className="text-gray-400 mt-1">
              Manage your classes and student rosters
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + Create Class
          </Button>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          // Empty State
          <Card>
            <CardContent className="py-16">
              <div className="text-center space-y-4">
                <div className="text-6xl">📚</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    No classes yet
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Create your first class to start organizing students and assignments.
                  </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  + Create Your First Class
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Classes Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="hover:border-purple-500/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{classItem.name}</CardTitle>
                  <CardDescription>
                    {classItem.gradeLevel} • {classItem.subject}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      {classItem.studentCount} students
                    </div>
                    <Button variant="ghost" size="sm">
                      View →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Class Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Add a new class to organize your students and assignments.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Class Name *
                </label>
                <Input
                  placeholder="e.g., Math Period 2"
                  value={newClass.name}
                  onChange={(e) =>
                    setNewClass({ ...newClass, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Grade Level *
                </label>
                <Input
                  placeholder="e.g., 5th Grade"
                  value={newClass.gradeLevel}
                  onChange={(e) =>
                    setNewClass({ ...newClass, gradeLevel: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Subject *
                </label>
                <Input
                  placeholder="e.g., Mathematics"
                  value={newClass.subject}
                  onChange={(e) =>
                    setNewClass({ ...newClass, subject: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateClass}>Create Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default function ClassesPage() {
  return (
    <ProtectedRoute>
      <ClassesContent />
    </ProtectedRoute>
  )
}
