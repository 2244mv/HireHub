import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import ApplyJob from "./pages/ApplyJob";
import MyApplications from "./pages/MyApplications";
import PostJob from "./pages/PostJob";
import CandidateProfile from "./pages/CandidateProfile";

function ComingSoon({ title }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-5 text-center dark:bg-slate-950">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        {title}
      </h1>

      <p className="mt-3 text-slate-600 dark:text-slate-300">
        This feature will be implemented in the next step.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
      >
        Back to Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Anyone can browse jobs */}
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/jobs/:id/apply" element={<ApplyJob />} />

      {/* Only logged-in candidates can access these routes */}
      <Route element={<ProtectedRoute allowedRoles={["candidate"]} />}>
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />

        <Route path="/candidate/applications" element={<MyApplications />} />
        <Route path="/candidate/profile" element={<CandidateProfile />} />
      </Route>

      {/* Only logged-in recruiters can access these routes */}
      <Route element={<ProtectedRoute allowedRoles={["recruiter"]} />}>
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/jobs/new" element={<PostJob />} />
      </Route>

      <Route path="*" element={<ComingSoon title="Page Not Found" />} />
    </Routes>
  );
}

export default App;
