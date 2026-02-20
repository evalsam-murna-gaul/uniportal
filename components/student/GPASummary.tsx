interface CourseGrade {
  courseTitle: string;
  gpa: number;
  credits: number;
}

export default function GPASummary({ gpa, courseGrades }: { gpa: number; courseGrades: CourseGrade[] }) {
  const gpaColor = gpa >= 4.5 ? 'text-green-600' : gpa >= 3.5 ? 'text-blue-600' : gpa >= 2.5 ? 'text-yellow-600' : 'text-red-500';
  const gpaLabel = gpa >= 4.5 ? 'First Class' : gpa >= 3.5 ? 'Second Class Upper' : gpa >= 2.5 ? 'Second Class Lower' : gpa >= 1.5 ? 'Third Class' : 'Pass';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 mb-4">GPA Summary</h2>
      <div className="flex items-center gap-6 mb-5">
        <div className="text-center">
          <p className={`text-5xl font-bold ${gpaColor}`}>{gpa.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Cumulative GPA</p>
        </div>
        <div className="flex-1">
          {/* GPA bar */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>0.0</span><span>5.0</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${gpa >= 4.5 ? 'bg-green-500' : gpa >= 3.5 ? 'bg-blue-500' : gpa >= 2.5 ? 'bg-yellow-500' : 'bg-red-400'}`}
              style={{ width: `${(gpa / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs font-medium text-gray-600 mt-1.5">{gpaLabel}</p>
        </div>
      </div>

      {courseGrades.length > 0 && (
        <div className="space-y-2">
          {courseGrades.map((cg, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="flex-1 text-gray-700 truncate">{cg.courseTitle}</span>
              <span className="text-xs text-gray-400">{cg.credits} cr</span>
              <span className={`font-semibold w-10 text-right ${cg.gpa >= 4.5 ? 'text-green-600' : cg.gpa >= 3.5 ? 'text-blue-600' : 'text-yellow-600'}`}>
                {cg.gpa.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}