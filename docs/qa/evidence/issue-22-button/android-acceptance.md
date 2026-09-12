# Android development build 验收记录（运行未完成）

- 日期：2026-09-12，Asia/Shanghai。
- 设备：仅 AVD Medium_Phone_API_36.0 / emulator-5554；未操作 unauthorized 物理手机。
- 应用：dev.learnui.gallery，development client；目标 Metro 8089。
- 构建：VERIFIED，Temurin JDK 21.0.12.1+1，`expo run:android --device Medium_Phone_API_36.0 --no-bundler`。`BUILD SUCCESSFUL in 27m 11s`，455 tasks（116 executed、8 from cache、331 up-to-date）。
- APK：apps/native-gallery/android/app/build/outputs/apk/debug/app-debug.apk。
- 构建完整日志：/tmp/learnui-button-android-build-jdk21.log。
- 安装：UNVERIFIED。Expo 安装阶段 emulator offline，后续直接 adb install 报 `cmd: Can't find service: package`。未能确认 APK 安装成功。
- 启动、Button 页、system/light/dark、variants/sizes、disabled/pending、名称与装饰 Spinner AX、20 次 rapid 最终计数、OS Remove animations：全部 UNVERIFIED。未取得该页面运行截图/AX，不以 mock/export 代替。

## 环境排障证据

1. Android Studio JBR 25.0.3：Prefab 原生访问 warning 导致 CMake configuration 失败；/tmp/learnui-button-android-build.log。
2. Homebrew openjdk@23 实际指向 JDK 26，重试失败；/tmp/learnui-button-android-build-jdk23.log。
3. 官方 Adoptium API 下载临时 JDK21 到 /tmp/jdk-21.0.12.1+1，无系统安装、源码依赖修改；该环境完成编译。
4. 独立 agent-device 0.20.10 状态目录 /tmp/learnui-button-android-daemon，session button-android；共享 daemon 缺 adb PATH，独立 daemon 已解决，不影响 iOS。
5. 模拟器离线后默认冷启动：日志显示 Available Memory 4910 MB < Required 5120 MB，退回软件 GL；/tmp/learnui-button-android-emulator-restart.log。
6. 仅重启本任务模拟器，1536MB / 2 cores / no-window / no-snapshot-load；ADB 恢复 online，但系统包管理服务未启动，ActivityManager 栈采集 deadline exceeded；/tmp/learnui-button-android-emulator-lowmem.log、boot-errors.log、install.log。
7. 默认内存 / no-window / no-snapshot-save 尝试恢复快照；default_boot 不存在，自动冷启动；/tmp/learnui-button-android-emulator-snapshot.log。未 wipe 数据、未更改 OS 动画偏好。

运行检查必须待环境恢复后重做，不能将编译成功表述为 Android 验收通过。

## 最终复查与资源清理

- 复查 `service check package` 曾短暂返回 found，但紧接着安装仍报 `cmd: Can't find service: package`，见 install-final.log。因此安装/launch/UI 继续 UNVERIFIED。
- 最终 APK 已复制到 `/tmp/learnui-button-android-evidence/app-debug.apk`；SHA256 记录在 `binary-sha256.txt`。
- button-android close 返回 No active session（先前 open 未成功创建活跃session）。
- 独立 daemon `/tmp/learnui-button-android-daemon` 已 graceful stopped；未操作 iOS 共享 daemon。
- 仅 emulator-5554 执行 emu kill 成功，未 wipe 数据；仓库生成 Android 工程保持原位交由 parent 保存。
