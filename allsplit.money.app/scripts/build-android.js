#!/usr/bin/env node

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const androidDir = path.join(projectRoot, "android");
const buildOutputDir = path.join(projectRoot, "build");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const variant = (process.argv[2] || "apk").toLowerCase();

if (variant !== "debug") {
  loadEnvFile(path.join(projectRoot, ".env.production"));
  loadEnvFile(path.join(projectRoot, ".env"));
}

const tasks = {
  debug: {
    gradleTask: "assembleDebug",
    label: "Debug APK",
    findArtifact: () =>
      path.join(androidDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk"),
    outputName: "allsplit-debug.apk",
  },
  apk: {
    gradleTask: "assembleRelease",
    label: "Release APK",
    findArtifact: () =>
      path.join(androidDir, "app", "build", "outputs", "apk", "release", "app-release.apk"),
    outputName: "allsplit-release.apk",
  },
  aab: {
    gradleTask: "bundleRelease",
    label: "Release AAB",
    findArtifact: () =>
      path.join(
        androidDir,
        "app",
        "build",
        "outputs",
        "bundle",
        "release",
        "app-release.aab"
      ),
    outputName: "allsplit-release.aab",
  },
};

const config = tasks[variant];

if (!config) {
  console.error(`Unknown build variant "${variant}". Use: debug | apk | aab`);
  process.exit(1);
}

if (!fs.existsSync(androidDir)) {
  console.error("Android project not found. Run: npm run prebuild");
  process.exit(1);
}

const gradleCmd = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const gradlePath = path.join(androidDir, gradleCmd);

console.log(`\nBuilding ${config.label}...\n`);

const result = spawnSync(gradlePath, [config.gradleTask], {
  cwd: androidDir,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const artifactPath = config.findArtifact();

if (!fs.existsSync(artifactPath)) {
  console.error(`Build finished but artifact was not found at:\n${artifactPath}`);
  process.exit(1);
}

fs.mkdirSync(buildOutputDir, { recursive: true });
const copiedPath = path.join(buildOutputDir, config.outputName);
fs.copyFileSync(artifactPath, copiedPath);

console.log(`\n${config.label} ready:`);
console.log(`  ${copiedPath}`);
console.log(`\nGradle output:\n  ${artifactPath}\n`);
