import { useState, useRef, useEffect } from "react";
import {
  checkUsernameAvailable,
  checkEmailAvailable,
} from "../../services/user";

const INITIAL_FORM = {
  email: "",
  user_name: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  role: "fulltime",
  password: "",
  confirm_password: "",
};

const INITIAL_ERRORS = {
  email: "",
  user_name: "",
  password: "",
  confirm_password: "",
};

const DEBOUNCE_MS = 500;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(name, value, currentForm) {
  switch (name) {
    case "email":
      return value && !isValidEmail(value)
        ? "Please enter a valid email address."
        : "";
    case "password":
      return value && value.length < 6
        ? "Password must be at least 6 characters."
        : "";
    case "confirm_password":
      return value && value !== currentForm.password
        ? "Passwords do not match."
        : "";
    default:
      return "";
  }
}

function useCustodianRegistration({ onSubmit, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [checking, setChecking] = useState({ email: false, user_name: false });

  // Debounce timers, kept across renders without triggering re-render themselves
  const emailTimer = useRef(null);
  const usernameTimer = useRef(null);

  // Clean up pending timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(emailTimer.current);
      clearTimeout(usernameTimer.current);
    };
  }, []);

  const isComplete =
    form.email.trim() &&
    form.user_name.trim() &&
    form.first_name.trim() &&
    form.last_name.trim() &&
    form.password.trim() &&
    form.confirm_password.trim() &&
    !errors.email &&
    !errors.user_name &&
    !errors.password &&
    !errors.confirm_password &&
    !checking.email &&
    !checking.user_name;

  const runEmailAvailabilityCheck = (value) => {
    clearTimeout(emailTimer.current);

    if (!value || !isValidEmail(value)) return;

    emailTimer.current = setTimeout(async () => {
      setChecking((prev) => ({ ...prev, email: true }));
      try {
        const available = await checkEmailAvailable(value);
        setErrors((prev) => ({
          ...prev,
          email: available ? "" : "This email is already registered.",
        }));
      } finally {
        setChecking((prev) => ({ ...prev, email: false }));
      }
    }, DEBOUNCE_MS);
  };

  const runUsernameAvailabilityCheck = (value) => {
    clearTimeout(usernameTimer.current);

    if (!value.trim()) return;

    usernameTimer.current = setTimeout(async () => {
      setChecking((prev) => ({ ...prev, user_name: true }));
      try {
        const available = await checkUsernameAvailable(value);
        setErrors((prev) => ({
          ...prev,
          user_name: available ? "" : "This username is already taken.",
        }));
      } finally {
        setChecking((prev) => ({ ...prev, user_name: false }));
      }
    }, DEBOUNCE_MS);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validate("password", value, form),
        confirm_password:
          form.confirm_password && value !== form.confirm_password
            ? "Passwords do not match."
            : "",
      }));
      return;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: validate(name, value, form),
    }));

    if (name === "email") {
      runEmailAvailabilityCheck(value);
    }

    if (name === "user_name") {
      runUsernameAvailabilityCheck(value);
    }
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    const { confirm_password, ...submitData } = form;
    onSubmit(submitData);
    onClose();
  };

  return { form, errors, checking, isComplete, handleChange, handleSubmit };
}

export default useCustodianRegistration;