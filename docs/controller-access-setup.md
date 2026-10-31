# Controller access

Controller access is managed inside the application by the Head:

1. Sign in as Fashy in Head Mode.
2. Open Settings → Manage Employees.
3. Ensure the employee has a configured six-digit PIN.
4. Turn on the **Controller** toggle beside that employee.

The toggle updates the employee's authenticated Firestore user profile from role **worker** to role **controller**. Authorization therefore remains tied to the stable Firebase Authentication UID, not merely to a displayed or selected name.

The public Controller name list in the workers master-data document is used only to populate the Controller login dropdown. It does not grant access. Firebase Authentication and the user's protected role field determine access after the PIN is submitted.

Turning the toggle off changes the account back to Worker access. PINs, passwords, authentication tokens, and private keys are never stored in Firestore or shown in the employee list.
