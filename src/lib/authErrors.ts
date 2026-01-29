export function mapSupabaseAuthError(err: any): string {
  if (!err) return "";

  console.log('[AUTH ERROR] Error object:', err);
  
  const msg = err.message?.toLowerCase() || "";
  const code = err.code || "";

  // Log detailed error info for debugging
  console.log('[AUTH ERROR] Details:', {
    message: err.message,
    code: err.code,
    status: err.status,
    raw: err
  });

  if (msg.includes("already registered") || msg.includes("duplicate")) {
    return "This email is already registered try logging in instead";
  }

  if (msg.includes("invalid login credentials")) {
    return "Email or password is incorrect";
  }

  if (msg.includes("password") && msg.includes("weak")) {
    return "Password is too weak use at least 8 characters";
  }

  if (code === "validation_failed") {
    return "Please check your input - email format or password requirements may not be met";
  }

  if (code === "email_exists") {
    return "This email is already registered try logging in instead";
  }

  if (err.status === 400) {
    return "Authentication failed please check your details";
  }

  if (err.status === 429) {
    return "Too many requests please try again later";
  }

  if (err.status >= 500) {
    return "Server error please try again in a few minutes";
  }

  return `Something went wrong please try again (Error: ${code || 'unknown'})`;
}