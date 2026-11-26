CS SECURE LOGIN - GITHUB PAGES + GOOGLE SHEETS
================================================

WHAT IS INCLUDED
- index.html       Login and admin-code screens
- admin.html       Admin activity dashboard
- style.css        Responsive Google-inspired CS theme
- app.js           Login flow
- admin.js         Admin dashboard
- config.js        Apps Script URL setting
- Code.gs          Google Apps Script backend

IMPORTANT
This is a small-group access log / prototype, not strong identity authentication.
Anyone who knows the admin username, full name and code can impersonate the admin. The admin code is checked on the Apps Script server, not in the public website source. Do not use this to protect sensitive systems or private data. User-entered names are not proof of identity.

STEP 1 - CREATE GOOGLE SHEET
1. Open https://sheets.google.com and create a blank spreadsheet.
2. Give it a name such as CS Secure Login Logs.
3. In the sheet, choose Extensions > Apps Script.
4. Delete the sample code and paste all the contents of Code.gs from this folder.
5. Save the project.

STEP 2 - SET ADMIN CODE ON SERVER
1. In Apps Script, open Project Settings (gear icon).
2. Find Script Properties and click Add script property.
3. Property: ADMIN_CODE
4. Value: 21879
5. Save script properties.

STEP 3 - DEPLOY APPS SCRIPT
1. Click Deploy > New deployment.
2. Select type: Web app.
3. Execute as: Me.
4. Who has access: Anyone.
5. Click Deploy and complete Google's authorization prompts.
6. Copy the Web app URL ending in /exec.
   Note: Anyone can submit a login record to this endpoint. Admin log reading and admin verification require the server-side admin code.

STEP 4 - CONNECT THE WEBSITE
1. Open config.js in this folder.
2. Replace PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE with your copied /exec URL.
3. Save config.js.

STEP 5 - UPLOAD TO GITHUB
1. Create a new GitHub repository (for example: cs-secure-login).
2. Upload all files in this folder to the repository root. Keep config.js, Code.gs and the HTML/JS/CSS files.
3. In repository Settings > Pages, select Deploy from a branch.
4. Select branch main and folder /(root), then Save.
5. Open the GitHub Pages URL shown there.

HOW TO USE
- Normal visitor: enter a username and full name. Their entry is recorded in the shared Google Sheet.
- Admin: enter Username Devil and Full Name sandun ayantha. The admin-code screen appears. Enter 21879 to open the admin dashboard.
- The admin dashboard reads the shared Google Sheet and displays recorded entries.

ADMIN CODE CHANGE
Change the ADMIN_CODE Script Property in Apps Script. Do not put the admin code in index.html, app.js or config.js. If you change the code, redeploy only if you changed the Apps Script source; Script Properties changes take effect without redeploying.

TROUBLESHOOTING
- If it says URL is not set: check config.js and ensure it contains the /exec URL.
- If server response times out: check Apps Script deployment access is Anyone, and that you copied the deployed /exec URL.
- If you edit Code.gs after deploying: Deploy > Manage deployments > Edit (pencil) > select New version > Deploy.
- If a Google authorization warning appears during first deployment, review the permissions and continue only if you trust your own script.

PRIVACY
The sheet contains usernames, full names, timestamps and login statuses entered by visitors. Restrict access to the Google Sheet itself to the owner/admin only. Do not share the spreadsheet publicly.
