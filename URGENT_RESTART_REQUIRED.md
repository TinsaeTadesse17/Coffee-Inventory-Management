# ⚠️ Action Required: Restart Server

The system has been updated with new database features (Processing Status, Multi-batch inputs), but the changes cannot be fully applied because your development server is locking the database client files.

**You must restart your server to fix the "Failed to complete processing run" error.**

Please run the following commands in your terminal:

1.  **Stop the running server** (Ctrl+C).
2.  Run the generator command manually to ensure it works:
    ```powershell
    npx prisma generate
    ```
3.  **Start the server again**:
    ```powershell
    npm run dev
    ```
    (or `start-dev.bat` if you use that)

Once restarted, the "Complete Processing Run" feature will work correctly.
