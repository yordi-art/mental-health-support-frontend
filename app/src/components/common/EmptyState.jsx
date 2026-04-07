export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={40} className="text-gray-300 mb-3" />}
      <p className="font-medium text-gray-500">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
    </div>
  );
}
