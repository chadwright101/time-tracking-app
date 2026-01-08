import { useState, useEffect } from "react";
import {
  initDB,
  addTimeEntry,
  updateTimeEntry,
  getAllTimeEntries,
  getEntriesByProject,
  deleteTimeEntry,
  exportAllData,
  clearAllData,
} from "../_lib/idb-service";

const roundToNearest15 = (minutes) => {
  return Math.ceil(minutes / 15) * 15;
};

export const useTimeTracker = () => {
  const [currentTimer, setCurrentTimer] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isDBReady, setIsDBReady] = useState(false);

  useEffect(() => {
    initDB().then(() => {
      setIsDBReady(true);
      refreshEntries();
    });
  }, []);

  const refreshEntries = async () => {
    const allEntries = await getAllTimeEntries();
    const sortedEntries = allEntries
      ? [...allEntries].sort(
          (a, b) => new Date(b.startTime) - new Date(a.startTime)
        )
      : [];
    setEntries(sortedEntries);
  };

  const startTimer = async (project) => {
    if (currentTimer) {
      await stopTimer();
    }

    const newEntry = {
      project,
      duration: 0,
      startTime: new Date().toISOString(),
      endTime: null,
    };

    const id = await addTimeEntry(newEntry);
    setCurrentTimer({ ...newEntry, id });
    await refreshEntries();
  };

  const stopTimer = async () => {
    if (!currentTimer) return;

    const endTime = new Date();
    const startTime = new Date(currentTimer.startTime);
    let duration = (endTime - startTime) / (1000 * 60);

    duration = roundToNearest15(duration);

    await updateTimeEntry(currentTimer.id, {
      endTime: endTime.toISOString(),
      duration,
    });

    setCurrentTimer(null);
    await refreshEntries();
  };

  const getProjectTime = async (project) => {
    const projectEntries = await getEntriesByProject(project);
    return projectEntries.reduce(
      (total, entry) => total + (entry.duration || 0),
      0
    );
  };

  const editEntry = async (id, updates) => {
    await updateTimeEntry(id, updates);
    await refreshEntries();
  };

  const deleteEntry = async (id) => {
    await deleteTimeEntry(id);
    if (currentTimer && currentTimer.id === id) {
      setCurrentTimer(null);
    }
    await refreshEntries();
  };

  const resumeEntry = async (entry) => {
    if (currentTimer) {
      await stopTimer();
    }

    const previousDurationMinutes = entry.duration || 0;
    const previousDurationMs = previousDurationMinutes * 60 * 1000;
    const newStartTime = new Date(Date.now() - previousDurationMs).toISOString();

    const updatedEntry = {
      ...entry,
      startTime: newStartTime,
      endTime: null,
    };

    await updateTimeEntry(entry.id, { startTime: newStartTime, endTime: null });
    setCurrentTimer(updatedEntry);
    await refreshEntries();
  };

  const exportData = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `time-tracker-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const clearData = async () => {
    try {
      await clearAllData();
      await refreshEntries();
      return { success: true };
    } catch (error) {
      console.error("Clear failed:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    isDBReady,
    currentTimer,
    entries,
    startTimer,
    stopTimer,
    getProjectTime,
    editEntry,
    deleteEntry,
    resumeEntry,
    refreshEntries,
    clearData,
    exportData,
  };
};
