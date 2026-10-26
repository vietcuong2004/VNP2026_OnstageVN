export const DEMO_EMAIL = "admin@onstage.com";
export const DEMO_PASSWORD = "Admin123456";
export const DEMO_TOKEN = "onstagevn-public-demo-session";
export const DEMO_READ_ONLY_MESSAGE = "Tài khoản trải nghiệm chỉ xem dữ liệu mẫu, không thay đổi dữ liệu thật.";

export function isDemoEnabled() {
  return process.env.NEXT_PUBLIC_PROFILE_SOURCE === "mock";
}

export function authenticateDemo(email: string, password: string) {
  if (!isDemoEnabled() || email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return null;
  }

  return {
    token: DEMO_TOKEN,
    user: {
      id: -1,
      name: "Tài khoản trải nghiệm",
      email: DEMO_EMAIL,
      type: "user" as const,
      status: "active",
      capabilities: ["talent", "brand"] as Array<"talent" | "brand">,
    },
  };
}

export function isDemoToken(token: string | null) {
  return token === DEMO_TOKEN;
}
