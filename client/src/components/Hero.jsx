import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Search,
  Users,
} from "lucide-react";

function Hero() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const highlights = [
    {
      icon: Search,
      title: "Discover opportunities",
      description: "Find roles that match your skills.",
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
    {
      icon: Users,
      title: "Build your career",
      description: "Connect with hiring teams.",
      color:
        "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    },
    {
      icon: Building2,
      title: "Meet great companies",
      description: "Explore your next workplace.",
      color:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
  ];

  const handleSearch = (event) => {
    event.preventDefault();

    const keyword = searchTerm.trim();

    if (keyword) {
      navigate(`/jobs?search=${encodeURIComponent(keyword)}`);
    } else {
      navigate("/jobs");
    }
  };

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-2 lg:px-8">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
          <CheckCircle2 size={16} />
          Your next opportunity starts here
        </div>

        <h1 className="max-w-2xl text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
          Find a job that
          <span className="block text-indigo-600">moves you forward.</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
          Discover opportunities, connect with great companies, and take the
          next step in your career with HireHub.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-8 flex max-w-xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-3 px-3">
            <Search size={20} className="shrink-0 text-slate-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Job title, skill or keyword"
              aria-label="Search jobs"
              className="w-full bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Explore Jobs
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Built for candidates and recruiters.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-lg">
        <div className="absolute inset-8 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-700/20" />

        <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-indigo-100/50 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your career dashboard
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                Welcome to HireHub
              </h2>
            </div>

            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <BriefcaseBusiness size={25} />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 dark:border-slate-800"
                >
                  <div className={`rounded-xl p-3 ${item.color}`}>
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>

                  <ArrowRight size={18} className="shrink-0 text-slate-400" />
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl bg-indigo-600 p-5 text-white">
            <p className="text-sm text-indigo-100">
              Your next chapter begins today
            </p>
            <p className="mt-1 text-lg font-bold">Make your next move count.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
