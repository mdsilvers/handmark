import { Page, Locator } from '@playwright/test'

export class ClassManagementPage {
  readonly page: Page
  readonly heading: Locator
  readonly createClassButton: Locator
  readonly classNameInput: Locator
  readonly gradeInput: Locator
  readonly subjectInput: Locator
  readonly saveClassButton: Locator
  readonly addStudentButton: Locator
  readonly studentNameInput: Locator
  readonly studentEmailInput: Locator
  readonly saveStudentButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: /classes/i })
    this.createClassButton = page.getByRole('button', { name: /create class|new class/i })
    this.classNameInput = page.getByLabel(/class name/i)
    this.gradeInput = page.getByLabel(/grade/i)
    this.subjectInput = page.getByLabel(/subject/i)
    this.saveClassButton = page.getByRole('button', { name: /save|create/i })
    this.addStudentButton = page.getByRole('button', { name: /add student/i })
    this.studentNameInput = page.getByLabel(/student name/i)
    this.studentEmailInput = page.getByLabel(/student email/i)
    this.saveStudentButton = page.getByRole('button', { name: /save student/i })
  }

  async goto() {
    await this.page.goto('/classes')
  }

  async createClass(name: string, grade: string, subject: string) {
    await this.createClassButton.click()
    await this.classNameInput.fill(name)
    await this.gradeInput.fill(grade)
    await this.subjectInput.fill(subject)
    await this.saveClassButton.click()
  }

  async addStudent(name: string, email: string) {
    await this.addStudentButton.click()
    await this.studentNameInput.fill(name)
    await this.studentEmailInput.fill(email)
    await this.saveStudentButton.click()
  }

  async getClassByName(name: string): Promise<Locator> {
    return this.page.getByRole('listitem').filter({ hasText: name })
  }
}
