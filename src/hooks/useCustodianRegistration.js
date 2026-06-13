import { useState } from "react";

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
  password: "",
  confirm_password: "",
};

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

  const isComplete =
    form.email.trim() &&
    form.user_name.trim() &&
    form.first_name.trim() &&
    form.last_name.trim() &&
    form.password.trim() &&
    form.confirm_password.trim() &&
    !errors.email &&
    !errors.password &&
    !errors.confirm_password;

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
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: validate(name, value, form),
      }));
    }
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    const { confirm_password, ...submitData } = form;
    onSubmit(submitData);
    onClose();
  };

  return { form, errors, isComplete, handleChange, handleSubmit };
}

export default useCustodianRegistration;