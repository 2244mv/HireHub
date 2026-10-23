import { Search, Users, Building2 } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Find the right job",
    description:
      "Explore job listings and discover roles that match your experience and interests.",
  },
  {
    icon: Users,
    title: "Manage applications",
    description:
      "Keep track of your applications and stay organized throughout your job search.",
  },
  {
    icon: Building2,
    title: "Hire great talent",
    description:
      "Recruiters can publish opportunities and connect with suitable candidates.",
  },
];

function Features() {
  return (
    <section
      id="jobs"
      className="border-y border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-widest text-indigo-600 uppercase">
            Why HireHub?
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Everything you need for your next career move
          </h2>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
            A single place for candidates to find jobs and recruiters to
            discover talent.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-700"
              >
                <div className="inline-flex rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <Icon size={25} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
