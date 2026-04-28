import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { setDoc } from "firebase/firestore";
import { auth, userDocRef } from "../firebase";
import { useAuth, useRefreshUser } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const refreshUser = useRefreshUser();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError("Display name can't be empty.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateProfile(auth.currentUser, { displayName: trimmed });
      await setDoc(userDocRef(user.uid), { displayName: trimmed }, { merge: true });
      refreshUser();
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDisplayName(user?.displayName ?? "");
    setError("");
    setEditing(false);
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-amber-600 hover:text-amber-800 text-sm font-medium transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-75 transition-opacity"
        >
          <span className="text-xl">🍳</span>
          <span className="text-lg font-bold text-amber-800">Recipe Box</span>
        </button>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-amber-800 mb-8">Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 space-y-5">

          {/* Avatar initial */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {(user?.displayName ?? user?.email ?? "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-amber-900 truncate">
                {user?.displayName || <span className="text-gray-400 font-normal">No display name set</span>}
              </p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          <hr className="border-amber-100" />

          {/* Display name field */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Display Name
            </label>
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setError(""); }}
                  placeholder="Your name"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    error ? "border-red-400" : "border-amber-200"
                  }`}
                  autoFocus
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700">
                  {user?.displayName || <span className="text-gray-400">Not set</span>}
                </span>
                <button
                  onClick={() => { setDisplayName(user?.displayName ?? ""); setEditing(true); }}
                  className="text-sm font-medium text-amber-600 hover:text-amber-800 transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Email
            </label>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {success && (
          <div className="mt-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
            Display name updated!
          </div>
        )}
      </main>
    </div>
  );
}
