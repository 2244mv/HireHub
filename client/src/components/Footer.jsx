import { Link } from "react-router-dom";
import { BriefcaseBusiness } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <BriefcaseBusiness size={20} className="text-indigo-600" />
          <span className="font-bold text-slate-900 dark:text-white">
            Hire<span className="text-indigo-600">Hub</span>
          </span>
        </Link>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Find opportunities. Build your future.
        </p>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} HireHub
        </p>
      </div>
    </footer>
  );
}

export default Footer;
