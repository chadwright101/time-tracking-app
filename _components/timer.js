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
    deleteEntry,
    exportData,
    clearData,
    refreshEntries,
  } = useTimeTracker();

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
                <span className="mr-2">{formatDuration(entry.duration)}</span>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-red-500"
                >
                  ×
                </button>
              </div>
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
