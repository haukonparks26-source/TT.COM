# TorqueTune iOS App Store Project

This folder contains a starter native iOS wrapper for TorqueTune.

## What It Includes

- SwiftUI iPhone app shell
- WKWebView loading `https://torquetune.net`
- Native back, forward, and refresh controls
- App icon generated from the TorqueTune cover image
- Launch screen
- Camera, microphone, and photo-library permission descriptions
- Version `1.0`, build `1`

## Before Uploading

1. Open `TorqueTune.xcodeproj` in Xcode.
2. Agree to the Xcode license if Xcode asks.
3. Select the `TorqueTune` target.
4. Go to `Signing & Capabilities`.
5. Select your Apple Developer team.
6. Change the bundle identifier if Apple says `com.torquetune.app` is already taken.

## TestFlight / App Store Upload

1. In Xcode, select `Any iOS Device`.
2. Choose `Product > Archive`.
3. In the Archives window, choose `Distribute App`.
4. Choose `TestFlight & App Store`.
5. Upload to App Store Connect.

Apple may reject apps that are only a repackaged website. To make approval stronger, keep adding native value over time, such as local diagnosis history, native photo capture, native sound recording, push notifications, or mechanic account features.
