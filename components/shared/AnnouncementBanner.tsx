export default function AnnouncementBanner({
  title,
  body,
  date,
}: {
  title: string;
  body: string;
  date: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-blue-100 p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">📢</span>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{body}</p>
          <p className="text-xs text-gray-400 mt-1.5">
            {new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}