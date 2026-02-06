// Grading review screen component stub
// Side-by-side: student work (left) + grades (right)
export function GradingReviewScreen() {
  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* Left: Student Work */}
      <div className="bg-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Student Work</h3>
        {/* Image viewer with zoom/rotate controls */}
      </div>
      
      {/* Right: Rubric & Grades */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Grades & Feedback</h3>
        {/* Rubric criteria with AI scores */}
      </div>
    </div>
  )
}
