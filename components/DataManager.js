import { useState } from "react";

export const DataManager = ({ exportData, importData, clearData }) => {
  const [importFile, setImportFile] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);

  const handleExport = async () => {
    setActionStatus({ type: "export", status: "processing" });
    const result = await exportData();
    setActionStatus({
      type: "export",
      status: result.success ? "success" : "error",
      message: result.success ? "Export completed!" : result.error,
    });
  };

  const handleImport = async () => {
    if (!importFile) return;

    setActionStatus({ type: "import", status: "processing" });
    const result = await importData(importFile);
    setActionStatus({
      type: "import",
      status: result.success ? "success" : "error",
      message: result.success
        ? `Imported ${result.importCount} entries (${result.errors} errors)`
        : result.error,
    });
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
            Export Data
          </button>
          <span className="text-sm">Download all time entries as JSON</span>
        </div>

        {/* Import Section */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            onChange={(e) => setImportFile(e.target.files[0])}
            className="border p-1"
          />
          <button
            onClick={handleImport}
            disabled={!importFile}
            className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            Import Data
          </button>
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
