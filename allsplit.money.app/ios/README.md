# AllSplit iOS (CocoaPods)

This folder is the native iOS project for GitHub Actions / Mac builds.

## Project names

| Item | Value |
|------|--------|
| Bundle ID | `com.allsplit.money` |
| Xcode project / scheme | `allsplitmoney` |
| Workspace (after pods) | `allsplitmoney.xcworkspace` |

> Expo sanitizes `allsplit.money` → `allsplitmoney`.

## Why CI runs `expo prebuild`

A full `.xcodeproj` cannot be generated on Windows. On `macos-latest` the workflow runs:

1. `npx expo prebuild --platform ios`
2. `pod install` (CocoaPods)
3. `xcodebuild` archive + export IPA

Committed files here (`Podfile`, `exportOptions.plist`, `.xcode.env`, etc.) stay in sync with that flow.

## Local Mac (optional)

```bash
cd allsplit.money.app
npm install
npx expo prebuild --platform ios
cd ios
pod install --repo-update
open allsplitmoney.xcworkspace
```

## Signing for IPA

Update `exportOptions.plist`:

- `teamID` → your Apple Team ID
- `method` → `development` | `ad-hoc` | `app-store`

Add GitHub secrets for Distribution certificate / provisioning profile when you move past unsigned CI checks.
