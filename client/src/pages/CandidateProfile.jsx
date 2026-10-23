import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, UserRound } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const initialForm = {
  name: "",
  avatar: "",
  phone: "",
  headline: "",
  bio: "",
  skills: "",
  experienceLevel: "",
  education: "",
  resumeUrl: "",
  linkedinUrl: "",
  githubUrl: "",
};

const fields = [
  { name: "name", label: "Full Name", required: true },
  {
    name: "headline",
    label: "Professional Headline",
    placeholder: "MERN Stack Developer",
  },
  { name: "phone", label: "Phone Number" },
  { name: "education", label: "Education", placeholder: "BSc / MSc / Degree" },
  { name: "avatar", label: "Avatar Image URL" },
  { name: "resumeUrl", label: "Resume URL" },
  { name: "linkedinUrl", label: "LinkedIn URL" },
  { name: "githubUrl", label: "GitHub URL" },
];

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-900";

export default function CandidateProfile() {
  const { getCurrentUser } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        const user = response.data.user;

        if (!active) return;

        setForm({
          name: user.name || "",
          avatar: user.avatar || "",
          phone: user.phone || "",
          headline: user.headline || "",
          bio: user.bio || "",
          skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
          experienceLevel: user.experienceLevel || "",
          education: user.education || "",
          resumeUrl: user.resumeUrl || "",
          linkedinUrl: user.linkedinUrl || "",
          githubUrl: user.githubUrl || "",
        });

        setCompletion(user.profileCompletion ?? 0);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load your profile.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      const response = await api.patch("/users/profile", payload);
      const user = response.data.user;

      setForm({
        name: user.name || "",
        avatar: user.avatar || "",
        phone: user.phone || "",
        headline: user.headline || "",
        bio: user.bio || "",
        skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
        experienceLevel: user.experienceLevel || "",
        education: user.education || "",
        resumeUrl: user.resumeUrl || "",
        linkedinUrl: user.linkedinUrl || "",
        githubUrl: user.githubUrl || "",
      });

      setCompletion(user.profileCompletion ?? 0);
      await getCurrentUser();
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/candidate/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                <UserRound size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  My Profile
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Keep your professional information up to date.
                </p>
              </div>
            </div>

            <div className="min-w-36">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Profile completion
                </span>
                <span className="font-bold text-indigo-600">{completion}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              Loading profile...
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-8"
            >
              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                >
                  {error}
                </p>
              )}

              {message && (
                <p
                  role="status"
                  className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                >
                  {message}
                </p>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {field.label}
                    </label>

                    <input
                      id={field.name}
                      name={field.name}
                      type={
                        field.name.toLowerCase().includes("url")
                          ? "url"
                          : "text"
                      }
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder || ""}
                      required={field.required || false}
                      maxLength={field.name === "name" ? 50 : undefined}
                      className={inputClass}
                    />
                  </div>
                ))}

                <div>
                  <label
                    htmlFor="experienceLevel"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Experience Level
                  </label>

                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={form.experienceLevel}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select experience</option>
                    <option value="fresher">Fresher</option>
                    <option value="0-1 years">0–1 years</option>
                    <option value="1-3 years">1–3 years</option>
                    <option value="3-5 years">3–5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="skills"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Skills
                  </label>

                  <input
                    id="skills"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="React.js, Node.js, MongoDB"
                    className={inputClass}
                  />

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Separate skills with commas.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="bio"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Professional Summary
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    rows={5}
                    maxLength={1000}
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Describe your experience, skills, and career goals..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
