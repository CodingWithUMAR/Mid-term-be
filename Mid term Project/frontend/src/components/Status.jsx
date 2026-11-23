export default function Status({ children, error = false }) {
  if (!children) return null;
  return <div role="status" className={`my-4 rounded-xl px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-lime-50 text-green-800"}`}>{children}</div>;
}
