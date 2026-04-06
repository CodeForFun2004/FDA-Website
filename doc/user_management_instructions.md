# 3.X User Management

The **User Management** section is found under the **Users & Roles** tab in the Admin Dashboard. This feature allows the **Super Admin** to oversee all user accounts, create new ones, update existing account information, and control account access.

---

## 3.X.1 View and Search Users

**Step 1: Navigate to the Users & Roles Tab**

After logging in with the Super Admin account, the system redirects to the Admin Dashboard.

On the left-hand sidebar, click on **"Users & Roles"** to open the user management section.

The main area now displays a data table listing all registered users in the system.

**Step 2: Understand the User Table**

The table presents the following columns for each user account:

- **User** – Displays the user's full name and email address, along with an avatar initial for quick recognition.
- **Role** – Shows the assigned role(s) of the user, displayed as a colored badge:
  - 🔴 **Super Admin** – Highest-level administrator
  - 🟣 **Admin** – System administrator
  - 🔵 **Authority** – Government/authority-level account
  - 🟢 **User** – Standard end-user account
- **Status** – Shows the current account status:
  - ✅ **Active** – The account is in normal use
  - ⛔ **Banned** – The account has been blocked from logging in
  - ⚪ **Inactive** – The account exists but is not currently active
- **Last Login** – The most recent date and time the user logged into the system.

**Step 3: Search and Filter the User List**

The toolbar above the table provides multiple ways to find specific users quickly:

- **Search box** – Type a name or email address to filter results as you type. Results update automatically.
- **Role filter** – Click the **"Role"** dropdown to show only users who have a specific role (e.g., Admin, Authority, User).
- **Status filter** – Click the **"Status"** dropdown to display only users with a chosen account status (e.g., Active, Banned).

Multiple filters can be combined at the same time for a more refined search.

---

## 3.X.2 Create a New User

**Step 1: Open the Create User Form**

In the User Management page, click the **"+ Add User"** button located at the top-right of the user table toolbar.

A dialog box titled **"Create New User"** will appear on the screen.

**Step 2: Fill in User Information**

The form contains the following fields (fields marked with * are required):

- **Email \*** – Enter a valid email address for the new user (e.g., `user@example.com`). This email will be used for login and system notifications.
- **Password \*** – Set an initial password for the account. The password must be at least **6 characters** long.
- **Full Name \*** – Enter the user's full name as it will be displayed in the system.
- **Phone Number** *(optional)* – Enter a 10–11 digit Vietnamese phone number. This field is not required but can be provided for contact purposes.
- **Status** – Select the initial account status from the dropdown:
  - **Active** – The user can log in immediately after the account is created.
  - **Inactive** – The account is created but the user cannot log in yet.
  - **Banned** – The account is created in a blocked state.
- **Role \*** – Choose the role assigned to this user. Available roles are:
  - **User** – Standard citizen/end-user (default)
  - **Admin** – System administrator
  - **Super Admin** – Highest-level administrator
  - **Authority** – Government or regulatory authority

**Step 3: Submit the Form**

After filling in all required fields, click the **"Create User"** button at the bottom of the dialog.

- If all information is valid, the system will create the account and display a success notification: *"User created successfully!"* The new user will immediately appear in the user table.
- If any required field is missing or invalid (e.g., incorrect email format, password too short, invalid phone number), the system will highlight the problematic field in red and display a clear error message asking you to correct it.

To close the form without creating a user, click **"Cancel"** or click outside the dialog box.

---

## 3.X.3 Edit an Existing User

> **Note:** Only user accounts that were **created by an admin** can be edited. Accounts registered directly by users through the app cannot be edited from this interface.

**Step 1: Open the Actions Menu**

In the user table, locate the user account you want to update.

Click the **⋮** (three-dot menu) icon located at the far-right of that user's row.

A small dropdown menu will appear showing the available actions.

**Step 2: Select "Edit"**

Click **"Edit"** from the dropdown menu.

An **"Edit User"** dialog box will appear, pre-filled with the user's current information.

> If the selected user was not created by an admin, the **Edit** option will be disabled (grayed out), and an error toast will appear indicating that only admin-created accounts can be edited.

**Step 3: Update User Information**

The edit form contains the following fields:

- **Email** – This field is shown for reference only and **cannot be changed**.
- **Full Name \*** – Update the user's display name.
- **Phone Number** *(optional)* – Update or add a phone number (10–11 digits).
- **Status \*** – Change the account's current status (Active / Inactive / Banned).
- **Role \*** – Change the user's assigned role. Use the radio buttons to select one of the available roles:
  - User
  - Admin
  - Super Admin
  - Authority

**Step 4: Save the Changes**

Click the **"Update"** button to save all changes.

- If the update is successful, a notification will appear: *"User updated successfully!"* The table will automatically refresh to reflect the changes.
- If an error occurs (e.g., a required field is empty or the phone number is in the wrong format), the system will display an error message next to the relevant field.

Click **"Cancel"** to close the dialog without saving any changes.

---

## 3.X.4 Ban / Unban a User

This action lets the Super Admin immediately block a user from logging into the system, or restore access to a previously banned account.

**Step 1: Open the Actions Menu**

In the user table, locate the user account you want to ban or unban.

Click the **⋮** (three-dot menu) icon at the right end of that user's row.

**Step 2: Select "Ban" or "Unban"**

- If the user's current status is **Active** or **Inactive**, the menu will show **"Ban"**.
- If the user's current status is already **Banned**, the menu will show **"Unban"**.

Click the appropriate option.

**Step 3: Confirm the Action**

A confirmation dialog will appear, showing:

- The email address of the user about to be banned or unbanned.
- A short explanation of what the action does:
  - *"User will not be able to sign in after being banned."*
  - *"User will be able to sign in after being unbanned."*

Click **"Ban user"** (or **"Unban user"**) to proceed, or click **"Cancel"** to go back without making any changes.

**Step 4: Outcome**

- If the action is successful, a confirmation toast message will appear:
  - *"User [email] has been banned."*
  - *"User [email] has been unbanned."*
- The user's **Status** badge in the table will immediately update to reflect the new state.
- A banned user will be immediately prevented from logging into the system until the Super Admin unbans their account.
