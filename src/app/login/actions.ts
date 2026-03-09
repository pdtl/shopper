"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createUser, verifyUser, createSession, deleteSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const user = await verifyUser(username, password);
  if (!user) {
    return { error: "Invalid username or password" };
  }

  const token = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set("shopper_session", token, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/list");
}

export async function signupAction(formData: FormData) {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }
  if (username.length < 2) {
    return { error: "Username must be at least 2 characters" };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match" };
  }

  const result = await createUser(username, password);
  if ("error" in result) {
    return { error: result.error };
  }

  const token = await createSession(result.id);
  const cookieStore = await cookies();
  cookieStore.set("shopper_session", token, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/list");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("shopper_session")?.value;
  if (token) {
    await deleteSession(token);
    cookieStore.delete("shopper_session");
  }
  redirect("/login");
}
