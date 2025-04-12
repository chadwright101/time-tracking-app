import { useState, useEffect } from "react";
import {
  initDB,
  addTimeEntry,
  updateTimeEntry,
  getAllTimeEntries,
  getEntriesByProject,
  deleteTimeEntry,
  exportAllData,
  importData as idbImportData,
  clearAllData,
} from "../lib/idbService";

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
    setEntries(allEntries || []);
  };

  const startTimer = async (project) => {
    if (currentTimer) {
      await stopTimer();
    }

    const newEntry = {
      project,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
    };

    const id = await addTimeEntry(newEntry);
    setCurrentTimer({ ...newEntry, id });
    await refreshEntries();
  };

  const stopTimer = async () => {
    if (!currentTimer) return;

    const endTime = new Date();
    const startTime = new Date(currentTimer.startTime);
    const duration = (endTime - startTime) / 1000; // in seconds

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

  const deleteEntry = async (id) => {
    await deleteTimeEntry(id);
    if (currentTimer && currentTimer.id === id) {
      setCurrentTimer(null);
    }
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

  const importData = async (file) => {
    try {
      const fileText = await file.text();
      const data = JSON.parse(fileText);
      const result = await idbImportData(data);
      await refreshEntries();
      return { success: true, ...result };
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
    deleteEntry,
    refreshEntries,
    importData,
    clearData,
    exportData,
  };
};
