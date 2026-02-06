# HandMark QA Checklist

Use this checklist for manual testing before each release.

## Browser Compatibility

### Desktop Browsers
- [ ] **Chrome (latest)** - All features work
- [ ] **Safari (latest)** - All features work
- [ ] **Firefox (latest)** - All features work
- [ ] **Edge (latest)** - All features work

### Mobile Browsers
- [ ] **Safari on iPhone** (iOS 15+)
  - [ ] All pages render correctly
  - [ ] Touch interactions work
  - [ ] Forms are usable
  - [ ] No horizontal scrolling
- [ ] **Safari on iPad**
  - [ ] All pages render correctly
  - [ ] Touch interactions work
  - [ ] Split-view works (if applicable)
- [ ] **Chrome on Android**
  - [ ] All pages render correctly
  - [ ] Touch interactions work

## Responsive Design

- [ ] **Mobile (320px - 480px)**
  - [ ] Navigation is accessible (hamburger menu)
  - [ ] Text is readable without zooming
  - [ ] Buttons are large enough to tap
  - [ ] Forms are usable
  - [ ] Images scale appropriately
- [ ] **Tablet (481px - 768px)**
  - [ ] Layout adapts appropriately
  - [ ] Navigation works well
  - [ ] Content is well-organized
- [ ] **Desktop (769px+)**
  - [ ] Multi-column layouts work
  - [ ] Sidebar navigation (if applicable)
  - [ ] No wasted space

## Accessibility

### Keyboard Navigation
- [ ] Tab through all interactive elements in logical order
- [ ] Shift+Tab works in reverse
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals/dialogs
- [ ] No keyboard traps
- [ ] Focus indicators are visible

### Screen Reader
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with NVDA (Windows)
- [ ] All images have alt text
- [ ] Form labels are associated correctly
- [ ] Error messages are announced
- [ ] Page titles are descriptive
- [ ] Headings are properly structured (h1 → h2 → h3)
- [ ] ARIA landmarks are used correctly

### Visual Accessibility
- [ ] Text contrast meets WCAG AA (4.5:1 for normal text)
- [ ] UI elements have 3:1 contrast ratio
- [ ] Text is resizable to 200% without loss of functionality
- [ ] No information conveyed by color alone
- [ ] Focus states are clearly visible

## User Flows

### Authentication
- [ ] Teacher can register with email/password
- [ ] Teacher can log in with valid credentials
- [ ] Invalid credentials show clear error message
- [ ] Password reset flow works end-to-end
- [ ] Session persists on page reload
- [ ] Session expires after timeout
- [ ] Logout works and clears session

### Class Management
- [ ] Teacher can create a new class
- [ ] Form validation works (required fields, grade range, etc.)
- [ ] Teacher can edit class details
- [ ] Teacher can archive/delete a class
- [ ] Confirmation shown before deletion
- [ ] Classes display in list/grid view
- [ ] Search/filter classes works

### Student Management
- [ ] Teacher can add students to a class
- [ ] Teacher can import students via CSV
- [ ] Duplicate emails are prevented
- [ ] Teacher can edit student details
- [ ] Teacher can remove students from class
- [ ] Student list displays correctly

### Assignment Creation
- [ ] Teacher can create new assignment
- [ ] Title, description, due date are saved correctly
- [ ] Rubric criteria can be added/edited/removed
- [ ] File upload works for answer key
- [ ] Assignment can be duplicated
- [ ] Assignment can be deleted

### Grading Workflow
- [ ] Student submissions can be uploaded (single/bulk)
- [ ] AI grading processes submissions
- [ ] Grades display correctly
- [ ] Teacher can adjust AI-suggested grades
- [ ] Teacher can add feedback comments
- [ ] Grades can be published to students
- [ ] Export grades to CSV works

### Dashboard & Analytics
- [ ] Dashboard loads with summary statistics
- [ ] Class performance charts display correctly
- [ ] Student progress is accurate
- [ ] Date range filters work
- [ ] Export reports to PDF works

## Loading & Error States

### Loading States
- [ ] Spinners/skeletons shown during data fetching
- [ ] Disabled state shown during form submission
- [ ] Progress indicators for long operations (bulk grading)
- [ ] Loading states don't block other interactions

### Empty States
- [ ] Empty class list shows helpful message + CTA
- [ ] Empty assignment list shows helpful message + CTA
- [ ] Empty student list shows helpful message + CTA
- [ ] Empty search results show clear message

### Error States
- [ ] Network errors show user-friendly message
- [ ] Form validation errors are clear and specific
- [ ] 404 page displays for invalid routes
- [ ] 500 error page displays for server errors
- [ ] Error messages suggest next steps
- [ ] Errors can be dismissed/retried

## Performance

- [ ] Initial page load < 2 seconds
- [ ] Time to Interactive < 3 seconds
- [ ] Navigation feels instant (< 100ms)
- [ ] Forms respond immediately to input
- [ ] Large lists are paginated or virtualized
- [ ] Images are optimized and lazy-loaded
- [ ] No layout shifts during loading
- [ ] No memory leaks (check DevTools)

## Data Integrity

- [ ] Form data persists on navigation (if expected)
- [ ] Unsaved changes prompt before leaving page
- [ ] Data syncs correctly between tabs
- [ ] Optimistic updates revert on failure
- [ ] No duplicate submissions
- [ ] Date/time displays in correct timezone
- [ ] Numerical calculations are accurate

## Security

- [ ] Protected routes redirect to login
- [ ] Expired sessions redirect to login
- [ ] CSRF protection is active
- [ ] XSS prevention (user input is sanitized)
- [ ] SQL injection prevention (parameterized queries)
- [ ] File upload types are restricted
- [ ] File upload size limits are enforced
- [ ] Sensitive data is not exposed in URLs
- [ ] API responses don't leak sensitive data

## Real-time Features

- [ ] WebSocket connection establishes successfully
- [ ] Real-time grade updates appear for all connected users
- [ ] Connection recovers after network interruption
- [ ] No duplicate messages
- [ ] Offline state is indicated clearly

## File Handling

- [ ] PDF uploads work
- [ ] Image uploads work (JPG, PNG)
- [ ] Unsupported file types are rejected
- [ ] File size limits are enforced
- [ ] Upload progress is shown
- [ ] Large files don't freeze UI
- [ ] File downloads work correctly

## Edge Cases

- [ ] Very long class names display correctly
- [ ] Very long student names display correctly
- [ ] Special characters in names (apostrophes, accents, etc.)
- [ ] Emoji in text fields don't break display
- [ ] Classes with 0 students display correctly
- [ ] Assignments with 0 submissions display correctly
- [ ] Dates far in the future/past work correctly
- [ ] Grades of 0, 100, and partial values work
- [ ] Extra credit (> 100%) works if supported

## Multi-user Scenarios

- [ ] Two teachers can work simultaneously
- [ ] Concurrent edits handle conflicts gracefully
- [ ] Student sees updated grades immediately
- [ ] Real-time updates don't conflict

## Localization (if applicable)

- [ ] Date formats are correct for locale
- [ ] Number formats are correct for locale
- [ ] Currency displays correctly (if applicable)
- [ ] Timezone handling is correct

## Compliance

- [ ] FERPA compliance: Student data is protected
- [ ] Privacy policy is accessible
- [ ] Terms of service are accessible
- [ ] Cookie consent (if applicable)
- [ ] Data export for students/parents works
- [ ] Data deletion works (right to be forgotten)

## Pre-Release Final Check

- [ ] All critical bugs are fixed
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Code coverage meets threshold (80%+)
- [ ] No console errors in production build
- [ ] Environment variables are configured
- [ ] Database migrations are ready
- [ ] Rollback plan is documented
- [ ] Monitoring/alerting is configured

## Post-Deployment Smoke Test

- [ ] Application loads successfully
- [ ] Login works
- [ ] Create a test class
- [ ] Create a test assignment
- [ ] Submit a test grading request
- [ ] API health check returns 200
- [ ] Database connections are healthy
- [ ] Background jobs are processing

---

**Tester:** _______________  
**Date:** _______________  
**Version:** _______________  
**Notes:**
