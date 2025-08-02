import { useState } from "react";
import { exportData as exportDataAction } from "../_actions/send-email";
import { getAllTimeEntries, clearAllData } from "../_lib/idb-service";
import { Spinner } from "./spinner";

export const DataManager = ({ onDataCleared }) => {
  const [actionStatus, setActionStatus] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setActionStatus({ type: "export", status: "processing" });
    try {
      const timeEntries = await getAllTimeEntries();
      if (!timeEntries || timeEntries.length === 0) {
        setActionStatus({
          type: "export",
          status: "error",
          message: "No time entries found.",
        });
        setIsExporting(false);
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
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="mt-8 p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Data Management</h3>

      <div>
        {/* Export Section */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors flex items-center gap-2"
          >
            {isExporting && <Spinner size="4" />}
            {isExporting ? "Sending..." : "Send Data via Email"}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Send all time entries as Excel via email
          </span>
        </div>


        {/* Status Messages */}
        {actionStatus && (
          <div
            className={`p-2 rounded ${
              actionStatus.status === "success"
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                : actionStatus.status === "error"
                ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
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
