import React, { useState, useEffect } from "react";
import { db, auth } from "../../services/firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import "./Faculty.css";

function Faculty() {
  const [faculties, setFaculties] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // fetch all faculty from firestore
  const fetchFaculties = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const facultyList = snapshot.docs
      .filter((doc) => doc.data().role === "faculty")
      .map((doc) => ({ id: doc.id, ...doc.data() }));
    setFaculties(facultyList);
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  // create faculty
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // create user in firebase auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // save to firestore with role faculty
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: name,
        email: email,
        role: "faculty",
      });

      setSuccess("Faculty created successfully!");
      setName("");
      setEmail("");
      setPassword("");
      fetchFaculties();
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Failed to create faculty.");
      }
    } finally {
      setLoading(false);
    }
  };

  // delete faculty
  const handleDelete = async (facultyId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this faculty?",
    );
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "users", facultyId));
      setSuccess("Faculty deleted successfully!");
      fetchFaculties();
    } catch (err) {
      setError("Failed to delete faculty.");
    }
  };

  return (
    <div className="faculty-wrapper">
      <h2>Faculty Management</h2>

      {/* create form */}
      <div className="faculty-form-box">
        <h3>Add Faculty</h3>
        {error && <p className="faculty-error">{error}</p>}
        {success && <p className="faculty-success">{success}</p>}
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group role-field">
            <input type="text" value="faculty" disabled />
            <span>Role is automatically set</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`faculty-btn ${loading ? "loading" : ""}`}
          >
            {loading ? "Creating..." : "Add Faculty"}
          </button>
        </form>
      </div>

      {/* faculty list */}
      <div className="faculty-list-box">
        <h3>Faculty List</h3>
        {faculties.length === 0 ? (
          <p className="faculty-empty">No faculty found.</p>
        ) : (
          <table className="faculty-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map((faculty) => (
                <tr key={faculty.id}>
                  <td>{faculty.name}</td>
                  <td>{faculty.email}</td>
                  <td>
                    <span className="role-badge">{faculty.role}</span>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(faculty.id)}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#cc0000")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "#ff4d4d")
                      }
                      onMouseDown={(e) =>
                        (e.target.style.background = "#990000")
                      }
                      onMouseUp={(e) => (e.target.style.background = "#cc0000")}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Faculty;
