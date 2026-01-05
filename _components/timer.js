"use client";

import { useState } from "react";
import { useTimeTracker } from "../_hooks/use-time-tracker";
import { DataManager } from "./data-manager";
import { DarkModeToggle } from "./dark-mode-toggle";

export const Timer = () => {
  const [projectName, setProjectName] = useState("");
  const {
    isDBReady,
    currentTimer,
    startTimer,
    stopTimer,
    entries,
    editEntry,
    deleteEntry,
    resumeEntry,
    exportData,
    clearData,
    refreshEntries,
  } = useTimeTracker();
  const [editingId, setEditingId] = useState(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [entryToDelete, setEntryToDelete] = useState(null);

  if (!isDBReady) return <div className="text-gray-900 dark:text-gray-100">Loading database...</div>;

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStopTimer = async () => {
    await stopTimer();
    setProjectName("");
  };

  const handleDataCleared = () => {
    refreshEntries();
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      await deleteEntry(entryToDelete.id);
      setEntryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setEntryToDelete(null);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Time Tracker</h1>
        <DarkModeToggle />
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
          className="border border-gray-300 dark:border-gray-600 p-2 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          disabled={!!currentTimer}
        />
      </div>

      <div className="mb-4">
        {currentTimer ? (
          <>
            <p className="text-gray-900 dark:text-gray-100">Tracking: {currentTimer.project}</p>
            <button
              onClick={handleStopTimer}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
            >
              Stop Timer
            </button>
          </>
        ) : (
          <button
            onClick={() => startTimer(projectName)}
            disabled={!projectName.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:opacity-50 transition-colors"
          >
            Start Timer
          </button>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Time Entries</h2>
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 flex justify-between rounded">
              {editingId === entry.id ? (
                <div className="flex-1">
                  <div className="mb-2">
                    <input
                      type="text"
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 p-1 w-full mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <div className="flex items-center">
                      <label className="mr-2 text-gray-900 dark:text-gray-100">Duration (minutes):</label>
                      <input
                        type="number"
                        min="15"
                        step="15"
                        value={entry.duration || 0}
                        onChange={(e) => {
                          const value = Math.max(
                            15,
                            Math.floor(e.target.value / 15) * 15
                          );
                          editEntry(entry.id, { duration: value });
                        }}
                        className="border border-gray-300 dark:border-gray-600 p-1 w-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        editEntry(entry.id, { project: editProjectName });
                        setEditingId(null);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-gray-900 dark:text-gray-100">{entry.project}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.startTime).toLocaleString()} -{" "}
                      {entry.endTime
                        ? new Date(entry.endTime).toLocaleString()
                        : "Active"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-900 dark:text-gray-100">
                      {formatDuration(entry.duration)}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(entry.id);
                        setEditProjectName(entry.project);
                      }}
                      className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 mr-2 transition-colors"
                    >
                      Edit
                    </button>
                    {entry.endTime && (
                      <button
                        onClick={() => resumeEntry(entry)}
                        className="text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 mr-2 transition-colors"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      onClick={() => setEntryToDelete(entry)}
                      className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        <DataManager
          onDataCleared={handleDataCleared}
        />
      </div>

      {entryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-sm">
            <p className="text-gray-900 dark:text-gray-100 mb-4">
              Delete entry for &quot;{entryToDelete.project}&quot;?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelDelete}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;
