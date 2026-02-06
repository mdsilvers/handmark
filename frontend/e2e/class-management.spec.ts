import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { ClassManagementPage } from './pages/ClassManagementPage'

test.describe('Class Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('teacher@test.com', 'password123')
    await expect(page).toHaveURL(/.*dashboard/)
    
    // Navigate to classes page
    const classPage = new ClassManagementPage(page)
    await classPage.goto()
  })

  test('should display classes page heading', async ({ page }) => {
    const classPage = new ClassManagementPage(page)
    await expect(classPage.heading).toBeVisible()
  })

  test('should create a new class', async ({ page }) => {
    const classPage = new ClassManagementPage(page)
    
    const className = 'Math 101'
    const grade = '10'
    const subject = 'Mathematics'
    
    await classPage.createClass(className, grade, subject)
    
    // Class should appear in the list
    const classItem = await classPage.getClassByName(className)
    await expect(classItem).toBeVisible()
  })

  test('should validate class creation form', async ({ page }) => {
    const classPage = new ClassManagementPage(page)
    
    // Try to create class without filling required fields
    await classPage.createClassButton.click()
    await classPage.saveClassButton.click()
    
    // Should show validation errors
    const classNameInput = classPage.classNameInput
    await expect(classNameInput).toHaveAttribute('required', '')
  })

  test('should add students to a class', async ({ page }) => {
    const classPage = new ClassManagementPage(page)
    
    // First create a class
    await classPage.createClass('Science 101', '9', 'Science')
    
    // Click on the class to view details
    const classItem = await classPage.getClassByName('Science 101')
    await classItem.click()
    
    // Add a student
    await classPage.addStudent('John Doe', 'john.doe@student.com')
    
    // Student should appear in the list
    const studentItem = page.getByText('John Doe')
    await expect(studentItem).toBeVisible()
  })

  test('should handle multiple students', async ({ page }) => {
    const classPage = new ClassManagementPage(page)
    
    // Create a class
    await classPage.createClass('English 101', '11', 'English')
    const classItem = await classPage.getClassByName('English 101')
    await classItem.click()
    
    // Add multiple students
    const students = [
      { name: 'Alice Smith', email: 'alice@student.com' },
      { name: 'Bob Johnson', email: 'bob@student.com' },
      { name: 'Carol Williams', email: 'carol@student.com' },
    ]
    
    for (const student of students) {
      await classPage.addStudent(student.name, student.email)
    }
    
    // All students should be visible
    for (const student of students) {
      const studentItem = page.getByText(student.name)
      await expect(studentItem).toBeVisible()
    }
  })

  test('should prevent duplicate student emails', async ({ page }) => {
    const classPage = new ClassManagementPage(page)
    
    // Create class and add student
    await classPage.createClass('History 101', '12', 'History')
    const classItem = await classPage.getClassByName('History 101')
    await classItem.click()
    
    await classPage.addStudent('Test Student', 'test@student.com')
    
    // Try to add another student with same email
    await classPage.addStudent('Another Student', 'test@student.com')
    
    // Should show error message
    const errorMessage = page.getByRole('alert')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText(/already exists|duplicate/i)
  })

  test('should edit class details', async ({ page }) => {
    const classPage = new ClassManagementPage(page)
    
    // Create a class
    await classPage.createClass('Original Name', '10', 'Math')
    
    // Click edit button
    const editButton = page.getByRole('button', { name: /edit/i }).first()
    await editButton.click()
    
    // Change class name
    await classPage.classNameInput.clear()
    await classPage.classNameInput.fill('Updated Name')
    await classPage.saveClassButton.click()
    
    // Updated name should be visible
    const updatedClass = await classPage.getClassByName('Updated Name')
    await expect(updatedClass).toBeVisible()
  })

  test('should delete a class', async ({ page }) => {
    const classPage = new ClassManagementPage(page)
    
    // Create a class
    const className = 'Class to Delete'
    await classPage.createClass(className, '8', 'Art')
    
    // Click delete button
    const deleteButton = page.getByRole('button', { name: /delete/i }).first()
    await deleteButton.click()
    
    // Confirm deletion
    const confirmButton = page.getByRole('button', { name: /confirm|yes/i })
    await confirmButton.click()
    
    // Class should no longer be visible
    await expect(page.getByText(className)).not.toBeVisible()
  })

  test('should search/filter classes', async ({ page }) => {
    const classPage = new ClassManagementPage(page)
    
    // Create multiple classes
    await classPage.createClass('Math 101', '10', 'Mathematics')
    await classPage.createClass('Science 101', '10', 'Science')
    await classPage.createClass('Math 201', '11', 'Mathematics')
    
    // Search for "Math"
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('Math')
    
    // Only Math classes should be visible
    await expect(page.getByText('Math 101')).toBeVisible()
    await expect(page.getByText('Math 201')).toBeVisible()
    await expect(page.getByText('Science 101')).not.toBeVisible()
  })
})
