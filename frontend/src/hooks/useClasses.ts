import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Class, CreateClassInput } from '@/types/database'

export function useClasses() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchClasses()
    }
  }, [user])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('user_id', user?.id)
        .is('archived_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClasses(data || [])
    } catch (err: any) {
      console.error('Error fetching classes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createClass = async (input: CreateClassInput): Promise<Class | null> => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('classes')
        .insert({
          user_id: user?.id,
          ...input,
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setClasses([data, ...classes])
      }

      return data
    } catch (err: any) {
      console.error('Error creating class:', err)
      setError(err.message)
      return null
    }
  }

  const deleteClass = async (classId: string): Promise<boolean> => {
    try {
      setError(null)

      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)

      if (error) throw error

      setClasses(classes.filter((c) => c.id !== classId))
      return true
    } catch (err: any) {
      console.error('Error deleting class:', err)
      setError(err.message)
      return false
    }
  }

  return {
    classes,
    loading,
    error,
    fetchClasses,
    createClass,
    deleteClass,
  }
}
