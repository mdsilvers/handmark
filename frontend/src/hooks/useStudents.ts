import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Student, CreateStudentInput } from '@/types/database'

export function useStudents(classId: string | null) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (classId) {
      fetchStudents()
    }
  }, [classId])

  const fetchStudents = async () => {
    if (!classId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('name', { ascending: true })

      if (error) throw error
      setStudents(data || [])
    } catch (err: any) {
      console.error('Error fetching students:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addStudent = async (input: CreateStudentInput): Promise<Student | null> => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('students')
        .insert(input)
        .select()
        .single()

      if (error) throw error

      if (data) {
        setStudents([...students, data])
      }

      return data
    } catch (err: any) {
      console.error('Error adding student:', err)
      setError(err.message)
      return null
    }
  }

  const addStudentsBulk = async (inputs: CreateStudentInput[]): Promise<boolean> => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('students')
        .insert(inputs)
        .select()

      if (error) throw error

      if (data) {
        setStudents([...students, ...data])
      }

      return true
    } catch (err: any) {
      console.error('Error adding students in bulk:', err)
      setError(err.message)
      return false
    }
  }

  const deleteStudent = async (studentId: string): Promise<boolean> => {
    try {
      setError(null)

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)

      if (error) throw error

      setStudents(students.filter((s) => s.id !== studentId))
      return true
    } catch (err: any) {
      console.error('Error deleting student:', err)
      setError(err.message)
      return false
    }
  }

  return {
    students,
    loading,
    error,
    fetchStudents,
    addStudent,
    addStudentsBulk,
    deleteStudent,
  }
}
