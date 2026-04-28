const required = [
  "AUTH_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "APP_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY"
];

const optionalGroups = [
  ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"],
  ["AUTH_X_ID", "AUTH_X_SECRET"],
  ["AUTH_INSTAGRAM_ID", "AUTH_INSTAGRAM_SECRET"]
];

let failed = false;

console.log("== 必須環境変数 ==");
for (const key of required) {
  const ok = Boolean(process.env[key]);
  console.log(`${ok ? "OK " : "NG "} ${key}`);
  if (!ok) failed = true;
}

console.log("\n== OAuth 設定 ==");
for (const group of optionalGroups) {
  const present = group.filter((key) => Boolean(process.env[key]));
  if (present.length === 0) {
    console.log(`SKIP ${group.join(" / ")}`);
    continue;
  }
  if (present.length !== group.length) {
    console.log(`NG   ${group.join(" / ")} が片方だけ設定されています`);
    failed = true;
    continue;
  }
  console.log(`OK   ${group.join(" / ")}`);
}

if (failed) {
  console.error("\n公開前チェックに失敗しました。");
  process.exit(1);
}

console.log("\n公開前チェックに通過しました。");
