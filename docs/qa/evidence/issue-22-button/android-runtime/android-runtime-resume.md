# Android Button 最终运行补验

日期：2026-09-12。矩阵源码：25e1a25；Metro 8089 最终字体修复。真实 development APK 与先前成功编译产物完全相同，见 binary-sha256.txt。

## 环境与gate

- 当前内存空闲39%后，原 Medium_Phone_API_36.0 / emulator-5554 在32041ms启动完成；未wipe、未新建AVD。
- `adb install` Success，见 install-resume.log。Android development build 编译、安装、启动、进入Button均已 VERIFIED。
- Metro --localhost仅监听IPv6导致一度白屏；改为默认监听后127.0.0.1:8089可访问。仅5554执行reverse8089，加载当前worktree源码。
- agent-device 0.20.10 独立state-dir /tmp/learnui-button-android-daemon、session button-android。部分AX读取超时，按截图与后续成功AX恢复；未把工具错误当应用错误。

## 实际检查与证据

- System→resolved light：button-system-final.png、button-ready-ax.json，主按钮颜色/圆角/文字正常，无透明token故障。
- Dark→resolved dark：theme-dark.txt、button-dark.png；Light→resolved light：theme-light.txt。
- rapid：20次，50ms间隔、40ms按下，Presses 0→20，rapid20.txt。
- pending：Save lesson一次后Save activations 0→1；再按5次仍1；Finish saving恢复ready，pending-start.txt、pending-repeat.txt、pending-finish.txt、pending-final.png。
- pending AX：根android.widget.Button摘要label=busy，子TextView保留Save lesson，未出现Spinner/progress节点。完整pending-ax.json。不能据此声称TalkBack实际口播或所有聚合名称规则通过。尝试额外uiautomator XML dump返回137，未用其作为证据。
- variants：primary/secondary/outline/ghost/destructive在variants-final.png及variants-final-scroll.txt可见；sm/md/lg与disabled/pending在sizes-states.png、sizes-states-ax.json可见。
- Disabled action在AX enabled=false；实际5次按压后返回顶部Presses仍20，disabled-repeat.txt、variants-up.txt。
- icon-only：AX按钮名称Add lesson，视觉为+；sizes-states-ax.json、sizes-states.png。未出现单独Spinner AX节点。
- 系统减少动画：初值animator/window/transition三项均1。仅animator=0不会使页面enabled；工具settings animations off完整关闭后，页面即时显示Reduce Motion enabled / opacity feedback / no scale（reduced-all-on-ax.json、reduced-on.png）。此时按钮点击Presses21→22（reduced-enabled-press.txt），无崩溃。
- 设置已恢复animations on；后续页面即时显示Reduce Motion disabled（variants-final-scroll.txt）。这是系统设置及页面响应/可操作性证据，不声称帧级动画测量或真机流畅度测试通过。

## 仍不声称已验证

真人TalkBack口播、真机体验、帧率/动画流畅度、像素测量对比度、滚动中触摸cancel专项测试。本次50ms rapid序列不等同cancel中断测试。

## 合并后集成复查

parent重启包含最新main整合工作树的Metro后复查通过：首页Button/Badge/Divider/Card/Spinner五个入口存在，点击Button进入正常初始页面，Save activations0、Presses0、system resolved light。证据integrated-home.png、integrated-home-ax.json、integrated-button.png、integrated-button-ax.json。复查时HEAD仍25e1a25，main整合内容为工作树状态，由parent最终提交记录。系统API36，density420。

尺寸补充：wm density=420（2.625px/dp），AX sm/md/lg高度116/132/163px，约44.19/50.29/62.10dp，均不少于44dp。动画恢复读回值见animation-restored.json。
