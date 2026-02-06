// Rubric builder component stub
// Drag-drop criteria with point scales
export function RubricBuilder() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Create Rubric</h3>
      
      {/* Template selector */}
      <select className="w-full p-2 border rounded">
        <option>Start from template...</option>
        <option>3rd Grade Math - Problem Solving</option>
        <option>4th Grade Writing - Essay</option>
      </select>
      
      {/* Criteria list (drag-drop) */}
      <div className="space-y-2">
        {/* Criterion cards */}
      </div>
      
      {/* Add criterion button */}
      <button className="w-full p-3 border-2 border-dashed rounded-lg hover:bg-gray-50">
        + Add Criterion
      </button>
    </div>
  )
}
