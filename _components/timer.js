"use client";

import { useState } from "react";
import { useTimeTracker } from "../_hooks/use-time-tracker";
import { DataManager } from "./data-manager";

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
    exportData,
    clearData,
    refreshEntries,
  } = useTimeTracker();
  const [editingId, setEditingId] = useState(null);
  const [editProjectName, setEditProjectName] = useState("");

  if (!isDBReady) return <div>Loading database...</div>;

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

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Time Tracker</h1>

      <div className="mb-4">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
          className="border p-2 w-full"
          disabled={!!currentTimer}
        />
      </div>

      <div className="mb-4">
        {currentTimer ? (
          <>
            <p>Tracking: {currentTimer.project}</p>
            <button
              onClick={handleStopTimer}
              className="bg-red-500 text-white p-2 rounded"
            >
              Stop Timer
            </button>
          </>
        ) : (
          <button
            onClick={() => startTimer(projectName)}
            disabled={!projectName.trim()}
            className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
          >
            Start Timer
          </button>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Time Entries</h2>
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="border p-2 flex justify-between">
              {editingId === entry.id ? (
                <div className="flex-1">
                  <div className="mb-2">
                    <input
                      type="text"
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                      className="border p-1 w-full mb-2"
                    />
                    <div className="flex items-center">
                      <label className="mr-2">Duration (minutes):</label>
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
                        className="border p-1 w-20"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        editEntry(entry.id, { project: editProjectName });
                        setEditingId(null);
                      }}
                      className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p>{entry.project}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.startTime).toLocaleString()} -{" "}
                      {entry.endTime
                        ? new Date(entry.endTime).toLocaleString()
                        : "Active"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">
                      {formatDuration(entry.duration)}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(entry.id);
                        setEditProjectName(entry.project);
                      }}
                      className="text-blue-500 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-500"
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
          exportData={exportData}
          clearData={clearData}
          onDataCleared={handleDataCleared}
        />
      </div>
    </div>
  );
};

export default Timer;
