'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Spinner } from '@/components/ui/spinner'
import { supabase } from '@/lib/supabase'
import { useStudents } from '@/hooks/useStudents'
import { Class } from '@/types/database'

function ClassDetailContent() {
  const params = useParams()
  const router = useRouter()
  const classId = params?.id as string
  
  const [classData, setClassData] = useState<Class | null>(null)
  const [classLoading, setClassLoading] = useState(true)
  const { students, loading: studentsLoading, addStudent, addStudentsBulk, deleteStudent } = useStudents(classId)
  
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [importing, setImporting] = useState(false)
  
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    student_id: '',
  })

  const [csvText, setCsvText] = useState('')

  useEffect(() => {
    if (classId) {
      fetchClass()
    }
  }, [classId])

  const fetchClass = async () => {
    try {
      setClassLoading(true)
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single()

      if (error) throw error
      setClassData(data)
    } catch (err) {
      console.error('Error fetching class:', err)
      router.push('/dashboard/classes')
    } finally {
      setClassLoading(false)
    }
  }

  const handleAddStudent = async () => {
    if (!newStudent.name.trim()) {
      alert('Please enter a student name')
      return
    }

    setAdding(true)
    const result = await addStudent({
      class_id: classId,
      name: newStudent.name.trim(),
      email: newStudent.email.trim() || undefined,
      student_id: newStudent.student_id.trim() || undefined,
    })
    setAdding(false)

    if (result) {
      setNewStudent({ name: '', email: '', student_id: '' })
      setIsAddStudentModalOpen(false)
    }
  }

  const handleImportCSV = async () => {
    if (!csvText.trim()) {
      alert('Please paste CSV data')
      return
    }

    // Parse CSV (simple parser - assumes Name, Email, Student ID columns)
    const lines = csvText.trim().split('\n')
    const students = lines
      .slice(1) // Skip header
      .map(line => {
        const [name, email, student_id] = line.split(',').map(s => s.trim())
        return {
          class_id: classId,
          name,
          email: email || undefined,
          student_id: student_id || undefined,
        }
      })
      .filter(s => s.name) // Only include rows with a name

    if (students.length === 0) {
      alert('No valid student data found in CSV')
      return
    }

    setImporting(true)
    const success = await addStudentsBulk(students)
    setImporting(false)

    if (success) {
      setCsvText('')
      setIsImportModalOpen(false)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student?')) return
    await deleteStudent(studentId)
  }

  if (classLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (!classData) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-400">
              Class not found
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back to Classes
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">{classData.name}</h2>
              <p className="text-gray-400 mt-1">
                {classData.grade_level} • {classData.subject}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                📋 Import CSV
              </Button>
              <Button onClick={() => setIsAddStudentModalOpen(true)}>
                + Add Student
              </Button>
            </div>
          </div>
        </div>

        {/* Students Roster */}
        <Card>
          <CardHeader>
            <CardTitle>Student Roster ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="text-4xl">👥</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No students yet
                  </h3>
                  <p className="text-gray-400">
                    Add students individually or import from CSV
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                    Import CSV
                  </Button>
                  <Button onClick={() => setIsAddStudentModalOpen(true)}>
                    Add Student
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Student ID</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white">{student.name}</td>
                        <td className="py-3 px-4 text-gray-400">{student.email || '—'}</td>
                        <td className="py-3 px-4 text-gray-400">{student.student_id || '—'}</td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Student Modal */}
        <Dialog open={isAddStudentModalOpen} onOpenChange={setIsAddStudentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Student</DialogTitle>
              <DialogDescription>
                Add a new student to {classData.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Student Name *
                </label>
                <Input
                  placeholder="e.g., John Smith"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  disabled={adding}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Email (optional)
                </label>
                <Input
                  type="email"
                  placeholder="student@school.edu"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  disabled={adding}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Student ID (optional)
                </label>
                <Input
                  placeholder="e.g., 12345"
                  value={newStudent.student_id}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, student_id: e.target.value })
                  }
                  disabled={adding}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddStudentModalOpen(false)}
                disabled={adding}
              >
                Cancel
              </Button>
              <Button onClick={handleAddStudent} disabled={adding}>
                {adding ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Student'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import CSV Modal */}
        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Students from CSV</DialogTitle>
              <DialogDescription>
                Paste CSV data with columns: Name, Email, Student ID
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  CSV Data
                </label>
                <textarea
                  className="w-full h-48 bg-white/5 border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 resize-none"
                  placeholder="Name,Email,Student ID&#10;John Smith,john@school.edu,12345&#10;Jane Doe,jane@school.edu,12346"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  disabled={importing}
                />
                <p className="text-xs text-gray-500 mt-2">
                  First row should be headers. Email and Student ID are optional.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(false)}
                disabled={importing}
              >
                Cancel
              </Button>
              <Button onClick={handleImportCSV} disabled={importing}>
                {importing ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Importing...
                  </>
                ) : (
                  'Import Students'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default function ClassDetailPage() {
  return (
    <ProtectedRoute>
      <ClassDetailContent />
    </ProtectedRoute>
  )
}
