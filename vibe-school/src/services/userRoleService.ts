import { supabase } from "@/lib/supabase";

type Role = "student" | "teacher" | "admin";
type Plan = "free" | "member";

export async function setUserRole(userId: string, newRole: Role) {
  console.log("[ROLE] setUserRole called", { userId, newRole });

  // 1) sanity check - confirm how many rows exist for this user
  const pre = await supabase
    .from("profiles")
    .select("id,user_id,role", { count: "exact" })
    .eq("id", userId);

  console.log("[ROLE] pre-check result", {
    error: pre.error,
    count: pre.count,
    rows: pre.data,
  });

  if (pre.error) throw pre.error;

  // 2) if duplicates exist, stop early with clear error
  if ((pre.data?.length ?? 0) > 1) {
    console.error("[ROLE] DUPLICATE ROWS DETECTED for user_id", userId, pre.data);
    throw new Error(
      `Duplicate role/profile rows for user_id=${userId}. Fix DB uniqueness before updating.`
    );
  }

  // 3) if row exists, update exactly one row
  if ((pre.data?.length ?? 0) === 1) {
    const rowId = pre.data![0].id;
    console.log("[ROLE] updating existing row", { rowId, userId, newRole });

    const upd = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", rowId)              // IMPORTANT: update by primary key to guarantee 1 row
      .select("id,id,username,role,plan")    // return the updated row
      .maybeSingle();               // do not crash if 0 rows by accident

    console.log("[ROLE] update result", { error: upd.error, data: upd.data });

    if (upd.error) throw upd.error;
    if (!upd.data) throw new Error("Role update returned no row. Check RLS or filter.");
    return upd.data;
  }

  // 4) if no row exists, this shouldn't happen for role updates, but handle gracefully
  console.log("[ROLE] no profile row found for role update", { userId, newRole });
  throw new Error(`No profile found for user ${userId}. Cannot update role.`);
}

export async function setUserPlan(userId: string, newPlan: Plan) {
  console.log("[PLAN] setUserPlan called", { userId, newPlan });

  // 1) sanity check - confirm how many rows exist for this user
  const pre = await supabase
    .from("profiles")
    .select("id,user_id,plan", { count: "exact" })
    .eq("id", userId);

  console.log("[PLAN] pre-check result", {
    error: pre.error,
    count: pre.count,
    rows: pre.data,
  });

  if (pre.error) throw pre.error;

  // 2) if duplicates exist, stop early with clear error
  if ((pre.data?.length ?? 0) > 1) {
    console.error("[PLAN] DUPLICATE ROWS DETECTED for user_id", userId, pre.data);
    throw new Error(
      `Duplicate role/profile rows for user_id=${userId}. Fix DB uniqueness before updating.`
    );
  }

  // 3) if row exists, update exactly one row
  if ((pre.data?.length ?? 0) === 1) {
    const rowId = pre.data![0].id;
    console.log("[PLAN] updating existing row", { rowId, userId, newPlan });

    const upd = await supabase
      .from("profiles")
      .update({ plan: newPlan })
      .eq("id", rowId)              // IMPORTANT: update by primary key to guarantee 1 row
      .select("id,id,username,role,plan")    // return the updated row
      .maybeSingle();               // do not crash if 0 rows by accident

    console.log("[PLAN] update result", { error: upd.error, data: upd.data });

    if (upd.error) throw upd.error;
    if (!upd.data) throw new Error("Plan update returned no row. Check RLS or filter.");
    return upd.data;
  }

  // 4) if no row exists, this shouldn't happen for plan updates, but handle gracefully
  console.log("[PLAN] no profile row found for plan update", { userId, newPlan });
  throw new Error(`No profile found for user ${userId}. Cannot update plan.`);
}

export async function updateUserRoleAndPlan(userId: string, updates: { role?: Role; plan?: Plan }) {
  console.log("[USER] updateUserRoleAndPlan called", { userId, updates });

  // Get session for RLS debugging
  const { data: { session } } = await supabase.auth.getSession();
  console.log("[USER] session", session);

  // 1) sanity check - confirm how many rows exist for this user
  const pre = await supabase
    .from("profiles")
    .select("id,id,username,role,plan", { count: "exact" })
    .eq("id", userId);

  console.log("[USER] pre-check result", {
    error: pre.error,
    count: pre.count,
    rows: pre.data,
  });

  if (pre.error) throw pre.error;

  // 2) if duplicates exist, stop early with clear error
  if ((pre.data?.length ?? 0) > 1) {
    console.error("[USER] DUPLICATE ROWS DETECTED for user_id", userId, pre.data);
    throw new Error(
      `Duplicate role/profile rows for user_id=${userId}. Fix DB uniqueness before updating.`
    );
  }

  // 3) if row exists, update exactly one row
  if ((pre.data?.length ?? 0) === 1) {
    const rowId = pre.data![0].id;
    console.log("[USER] updating existing row", { rowId, userId, updates });

    const updateData: any = {};
    if (updates.role) updateData.role = updates.role;
    if (updates.plan) updateData.plan = updates.plan;

    const upd = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", rowId)              // IMPORTANT: update by primary key to guarantee 1 row
      .select("id,id,username,role,plan")    // return the updated row
      .maybeSingle();               // do not crash if 0 rows by accident

    console.log("[USER] update result", { error: upd.error, data: upd.data });

    if (upd.error) {
      console.error("[USER] possible RLS block. update matched rowId but returned error:", upd.error);
      throw upd.error;
    }
    
    if (!upd.data) {
      console.error("[USER] possible RLS block. update matched rowId but returned null");
      throw new Error("User update returned no row. Check RLS policies or permissions.");
    }
    
    return upd.data;
  }

  // 4) if no row exists, this shouldn't happen for updates, but handle gracefully
  console.log("[USER] no profile row found for user update", { userId, updates });
  throw new Error(`No profile found for user ${userId}. Cannot update user.`);
}