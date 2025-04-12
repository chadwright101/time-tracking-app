import { useState } from "react";
import { exportData as exportDataAction } from "../_actions/send-email";
import { getAllTimeEntries, clearAllData } from "../_lib/idb-service";

export const DataManager = ({ clearData, onDataCleared }) => {
  const [actionStatus, setActionStatus] = useState(null);

  const handleExport = async () => {
    setActionStatus({ type: "export", status: "processing" });
    try {
      const timeEntries = await getAllTimeEntries();
      if (!timeEntries || timeEntries.length === 0) {
        setActionStatus({
          type: "export",
          status: "error",
          message: "No time entries found.",
        });
        return;
      }

      const result = await exportDataAction(timeEntries);
      if (result.success) {
        await clearAllData();
        onDataCleared && onDataCleared();
        setActionStatus({
          type: "export",
          status: "success",
          message: "Email sent successfully and data cleared!",
        });
      } else {
        setActionStatus({
          type: "export",
          status: "error",
          message: result.error || "Failed to send email.",
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setActionStatus({
        type: "export",
        status: "error",
        message: "An unexpected error occurred.",
      });
    }
  };

  const handleClear = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear ALL time tracking data? This cannot be undone."
      )
    )
      return;

    setActionStatus({ type: "clear", status: "processing" });
    const result = await clearData();
    onDataCleared && onDataCleared();
    setActionStatus({
      type: "clear",
      status: result.success ? "success" : "error",
      message: result.success ? "All data cleared" : result.error,
    });
  };

  return (
    <div className="mt-8 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Data Management</h3>

      <div className="space-y-4">
        {/* Export Section */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Send Data via Email
          </button>
          <span className="text-sm">
            Send all time entries as Excel via email
          </span>
        </div>

        {/* Clear Section */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Clear All Data
          </button>
          <span className="text-sm text-red-600">
            Warning: This will delete all entries permanently
          </span>
        </div>

        {/* Status Messages */}
        {actionStatus && (
          <div
            className={`p-2 rounded ${
              actionStatus.status === "success"
                ? "bg-green-100 text-green-800"
                : actionStatus.status === "error"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {actionStatus.status === "processing" ? (
              "Processing..."
            ) : (
              <>
                <strong>
                  {actionStatus.type.toUpperCase()} {actionStatus.status}:
                </strong>{" "}
                {actionStatus.message}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
