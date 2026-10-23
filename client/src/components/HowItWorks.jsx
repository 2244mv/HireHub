import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Register as a candidate and set up your profile.",
  },
  {
    number: "02",
    title: "Explore opportunities",
    description: "Browse available jobs and find roles that interest you.",
  },
  {
    number: "03",
    title: "Apply and grow",
    description: "Submit applications and move forward in your career.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Get started in three simple steps
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mx-auto mt-2 max-w-sm leading-7 text-slate-600 dark:text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Create Your Account <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
