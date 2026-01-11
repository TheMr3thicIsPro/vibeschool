export function mapSupabaseAuthError(err: any): string {
  if (!err) return "";

  const msg = err.message?.toLowerCase() || "";

  if (msg.includes("already registered") || msg.includes("duplicate")) {
    return "This email is already registered try logging in instead";
  }

  if (msg.includes("invalid login credentials")) {
    return "Email or password is incorrect";
  }

  if (msg.includes("password") && msg.includes("weak")) {
    return "Password is too weak use at least 8 characters";
  }

  if (err.status === 400) {
    return "Authentication failed please check your details";
  }

  return "Something went wrong please try again";
}