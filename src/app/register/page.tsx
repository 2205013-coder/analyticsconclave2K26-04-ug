import { redirect } from 'next/navigation';

// Registration is closed — teams are created by admin via Bulk Import.
// Redirect anyone visiting /register back to the login page.
export default function RegisterPage() {
  redirect('/');
}
