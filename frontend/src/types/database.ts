export interface Class {
  id: string
  user_id: string
  name: string
  grade_level: string
  subject: string
  academic_year?: string
  school_id?: string
  google_classroom_id?: string
  created_at: string
  updated_at: string
  archived_at?: string
}

export interface Student {
  id: string
  class_id: string
  name: string
  email?: string
  student_id?: string
  google_id?: string
  created_at: string
  updated_at: string
}

export interface CreateClassInput {
  name: string
  grade_level: string
  subject: string
  academic_year?: string
}

export interface CreateStudentInput {
  class_id: string
  name: string
  email?: string
  student_id?: string
}
