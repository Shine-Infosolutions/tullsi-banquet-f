const Dashboard = () => {
  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 xl:px-10 py-4 lg:py-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-yellow-600">Dashboard</h1>
      </div>
      <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold mb-4 lg:mb-6">Welcome to Dashboard</h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">Dashboard content will be displayed here.</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard