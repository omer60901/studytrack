import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, note }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="panel p-5">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-400">{label}</span>
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-r from-purple-600/30 to-blue-500/30 text-blue-200 light:text-blue-700">
          <Icon size={20} />
        </span>
      </div>
      <div className="text-3xl font-black">{value}</div>
      <p className="mt-2 text-sm text-slate-400">{note}</p>
    </motion.div>
  );
}
