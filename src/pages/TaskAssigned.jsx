const TaskAssigned = () => {
  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-yellow-600">Task Assigned</h1>
      </div>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Task Assigned</h2>
          <p className="text-gray-600">Task assigned content will be displayed here.</p>
        </div>
      </div>
    </div>
  )
}

export default TaskAssigned