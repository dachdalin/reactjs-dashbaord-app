import { useActionState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signup, type SignupState } from "../../actions/authActions";

// Icon components for a polished look
const UserIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const EmailIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export function SignupForm() {
  const [state, action, pending] = useActionState<SignupState, FormData>(
    signup,
    undefined,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (state?.success) {
      navigate("/dashboard", { replace: true });
    }
  }, [state, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Glass morphism card */}
      <div className="w-full max-w-md">
        {/* Decorative gradient blur */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <form
          action={action}
          className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-gray-300">Join us and start your journey</p>
          </div>

          {/* Success/Error Message */}
          {state?.message && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm">
              <svg
                className="w-5 h-5 text-emerald-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-emerald-300 text-sm font-medium">
                {state.message}
              </p>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-200"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
              />
            </div>
            {state?.errors?.name && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {state.errors.name}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-200"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <EmailIcon />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
              />
            </div>
            {state?.errors?.email && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {state.errors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-200"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockIcon />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
              />
            </div>
            {state?.errors?.password && (
              <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm font-medium mb-1">
                  Password must:
                </p>
                <ul className="text-red-300 text-sm space-y-1">
                  {state.errors.password.map((error) => (
                    <li key={error} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-red-400" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            disabled={pending}
            type="submit"
            className="relative w-full py-4 px-6 rounded-xl font-semibold text-white overflow-hidden group disabled:cursor-not-allowed disabled:opacity-70 transition-all duration-300"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-[200%_100%] group-hover:animate-shimmer transition-all" />
            {/* Glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-r from-indigo-600/50 via-purple-600/50 to-indigo-600/50 blur-xl" />
            {/* Button content */}
            <span className="relative flex items-center justify-center gap-2">
              {pending && <SpinnerIcon />}
              {pending ? "Creating Account..." : "Create Account"}
            </span>
          </button>

          {/* Footer */}
          <p className="text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Sign in
            </a>
          </p>
        </form>

        {/* Terms */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By signing up, you agree to our{" "}
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default SignupForm;
