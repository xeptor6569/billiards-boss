"use client";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const calculateStrength = (pwd: string): {
    score: number;
    label: string;
    color: string;
  } => {
    if (!pwd) {
      return { score: 0, label: "", color: "" };
    }

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z\d]/.test(pwd)) score++;

    if (score <= 1) {
      return { score: 1, label: "Weak", color: "bg-red-500" };
    } else if (score <= 3) {
      return { score: 2, label: "Medium", color: "bg-yellow-500" };
    } else {
      return { score: 3, label: "Strong", color: "bg-green-500" };
    }
  };

  const strength = calculateStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${strength.color}`}
            style={{ width: `${(strength.score / 3) * 100}%` }}
          />
        </div>
        {strength.label && (
          <span
            className={`text-xs font-medium ${
              strength.score === 1
                ? "text-red-600 dark:text-red-400"
                : strength.score === 2
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {strength.label}
          </span>
        )}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        <ul className="list-disc list-inside space-y-0.5">
          <li className={password.length >= 8 ? "text-green-600 dark:text-green-400" : ""}>
            At least 8 characters
          </li>
          <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-green-600 dark:text-green-400" : ""}>
            Mix of uppercase and lowercase
          </li>
          <li className={/\d/.test(password) ? "text-green-600 dark:text-green-400" : ""}>
            Include numbers
          </li>
          <li className={/[^a-zA-Z\d]/.test(password) ? "text-green-600 dark:text-green-400" : ""}>
            Include special characters
          </li>
        </ul>
      </div>
    </div>
  );
}
