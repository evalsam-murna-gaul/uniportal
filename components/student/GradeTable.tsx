'use client';

interface GradeEntry {
  _id: string;
  course: { title: string; code: string; credits: number };
  assignment: string;
  score: number;
  maxScore: number;
  type: string;
  comment?: string;
  gradedAt: string;
}

function getLetterGrade(pct: number) {
  if (pct >= 70) return { letter: 'A', color: 'text-green-600' };
  if (pct >= 60) return { letter: 'B', color: 'text-blue-600' };
  if (pct >= 50) return { letter: 'C', color: 'text-yellow-600' };
  if (pct >= 45) return { letter: 'D', color: 'text-orange-500' };
  return { letter: 'F', color: 'text-red-600' };
}

export default function GradeTable({ grades }: { grades: GradeEntry[] }) {
  if (grades.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No grades recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Course</th>
            <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assignment</th>
            <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
            <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
            <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">%</th>
            <th className="text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Grade</th>
            <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g, i) => {
            const pct = Math.round((g.score / g.maxScore) * 100);
            const { letter, color } = getLetterGrade(pct);
            return (
              <tr key={g._id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                <td className="py-3 px-2">
                  <span className="font-mono text-xs text-blue-600 font-medium">{g.course.code}</span>
                </td>
                <td className="py-3 px-2 text-gray-800">{g.assignment}</td>
                <td className="py-3 px-2">
                  <span className="capitalize text-xs text-gray-500">{g.type}</span>
                </td>
                <td className="py-3 px-2 text-right text-gray-700">{g.score}/{g.maxScore}</td>
                <td className="py-3 px-2 text-right text-gray-700">{pct}%</td>
                <td className="py-3 px-2 text-center">
                  <span className={`font-bold text-sm ${color}`}>{letter}</span>
                </td>
                <td className="py-3 px-2 text-xs text-gray-400">
                  {new Date(g.gradedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}