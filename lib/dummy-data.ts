export const generateDummyData = (year: number = 2024) => {
  const dummyData: any = {}
  
  // Generate data for every day of the year
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split("T")[0]
      
      // Skip future dates
      if (date > new Date()) continue
      
      // Generate realistic data with some variation
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      
      // 85% chance of having data on weekdays, 60% on weekends
      const hasData = Math.random() < (isWeekend ? 0.6 : 0.85)
      
      if (hasData) {
        // Generate hours (0-6 range with realistic distribution)
        const hours = Math.random() < 0.1 ? 0 : // 10% chance of 0 hours
                     Math.random() < 0.2 ? Math.random() * 1 : // 20% chance of 0-1 hours
                     Math.random() < 0.4 ? 1 + Math.random() * 1.5 : // 40% chance of 1-2.5 hours
                     Math.random() < 0.7 ? 2.5 + Math.random() * 1.5 : // 30% chance of 2.5-4 hours
                     4 + Math.random() * 2 // 30% chance of 4-6 hours
        
        const roundedHours = Math.round(hours * 10) / 10
        
        // Generate task completion based on hours
        const taskCount = hours === 0 ? 0 :
                         hours < 1 ? 1 :
                         hours < 2.5 ? 2 :
                         hours < 4 ? 3 : 4
        
        const tasks = Array.from({ length: 4 }, (_, i) => ({
          completed: i < taskCount
        }))
        
        dummyData[dateStr] = {
          totalHours: roundedHours,
          completed: taskCount === 4,
          tasks
        }
      }
    }
  }
  
  return dummyData
}