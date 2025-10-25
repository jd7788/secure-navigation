// 后端验证逻辑：优化性能+增加日志+精简判断
export async function onRequestPost(context) {
  // 1. 预定义变量映射（避免函数内重复定义，减少内存占用）
  const PASSWORD_ENV_MAP = {
    // 常用工具
    "baidu": "BAIDU_PASSWORD", "google": "GOOGLE_PASSWORD", "github": "GITHUB_PASSWORD", "codepen": "CODEPEN_PASSWORD",
    // 视频平台
    "bilibili": "BILIBILI_PASSWORD", "youku": "YOUKU_PASSWORD", "iqiyi": "IQIYI_PASSWORD", "youtube": "YOUTUBE_PASSWORD", "tencent": "TENCENT_PASSWORD",
    // 社交网络
    "weixin": "WEIXIN_PASSWORD", "weibo": "WEIBO_PASSWORD", "douyin": "DOUYIN_PASSWORD", "kuaishou": "KUAIHOU_PASSWORD",
    // 在线音乐
    "neteaseMusic": "NETEASE_MUSIC_PASSWORD", "qqMusic": "QQ_MUSIC_PASSWORD", "kugouMusic": "KUGOU_MUSIC_PASSWORD", "kuwoMusic": "KUWO_MUSIC_PASSWORD", "xiamiMusic": "XIAMI_MUSIC_PASSWORD", "spotify": "SPOTIFY_PASSWORD",
    // 邮箱平台
    "neteaseMail": "NETEASE_MAIL_PASSWORD", "qqMail": "QQ_MAIL_PASSWORD", "gmail": "GMAIL_PASSWORD", "outlook": "OUTLOOK_PASSWORD", "sinaMail": "SINA_MAIL_PASSWORD", "sohuMail": "SOHU_MAIL_PASSWORD",
    // 学习平台
    "icourse": "ICOURESE_PASSWORD", "coursera": "COURSERA_PASSWORD", "neteaseClass": "NETEASE_CLASS_PASSWORD", "baijiajiangtan": "BAIJIA_PASSWORD"
  };

  const TARGET_URL_ENV_MAP = {
    // 常用工具
    "baidu": "BAIDU_TARGET_URL", "google": "GOOGLE_TARGET_URL", "github": "GITHUB_TARGET_URL", "codepen": "CODEPEN_TARGET_URL",
    // 视频平台
    "bilibili": "BILIBILI_TARGET_URL", "youku": "YOUKU_TARGET_URL", "iqiyi": "IQIYI_TARGET_URL", "youtube": "YOUTUBE_TARGET_URL", "tencent": "TENCENT_TARGET_URL",
    // 社交网络
    "weixin": "WEIXIN_TARGET_URL", "weibo": "WEIBO_TARGET_URL", "douyin": "DOUYIN_TARGET_URL", "kuaishou": "KUAIHOU_TARGET_URL",
    // 在线音乐
    "neteaseMusic": "NETEASE_MUSIC_TARGET_URL", "qqMusic": "QQ_MUSIC_TARGET_URL", "kugouMusic": "KUGOU_MUSIC_TARGET_URL", "kuwoMusic": "KUWO_MUSIC_TARGET_URL", "xiamiMusic": "XIAMI_MUSIC_TARGET_URL", "spotify": "SPOTIFY_TARGET_URL",
    // 邮箱平台
    "neteaseMail": "NETEASE_MAIL_TARGET_URL", "qqMail": "QQ_MAIL_TARGET_URL", "gmail": "GMAIL_TARGET_URL", "outlook": "OUTLOOK_TARGET_URL", "sinaMail": "SINA_MAIL_TARGET_URL", "sohuMail": "SOHU_MAIL_TARGET_URL",
    // 学习平台
    "icourse": "ICOURESE_TARGET_URL", "coursera": "COURSERA_TARGET_URL", "neteaseClass": "NETEASE_CLASS_TARGET_URL", "baijiajiangtan": "BAIJIA_TARGET_URL"
  };

  try {
    // 2. 解析请求（合并参数校验，减少分支）
    let requestData;
    try {
      requestData = await context.request.json();
    } catch (err) {
      console.error("请求解析错误：", err);
      return new Response(JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" }, status: 400
      });
    }

    const { siteKey, password } = requestData;
    if (!siteKey || !password) {
      console.log("请求缺少参数：siteKey或password");
      return new Response(JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" }, status: 400
      });
    }

    // 3. 验证密码（减少变量嵌套，直接读取环境变量）
    const pwdEnvName = PASSWORD_ENV_MAP[siteKey];
    const correctPassword = pwdEnvName ? context.env[pwdEnvName] : undefined;
    const isPwdValid = correctPassword && password === correctPassword;

    // 4. 记录非敏感日志（方便排查，不泄露密码）
    console.log(`验证请求：siteKey=${siteKey}，验证结果=${isPwdValid}`);

    // 5. 验证失败：直接返回，减少后续逻辑执行
    if (!isPwdValid) {
      return new Response(JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 6. 验证成功：返回目标网址（兜底空字符串，避免前端解析错误）
    const urlEnvName = TARGET_URL_ENV_MAP[siteKey];
    const targetUrl = urlEnvName ? context.env[urlEnvName] || "" : "";

    return new Response(JSON.stringify({
      success: true,
      targetUrl: targetUrl
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    // 7. 捕获全局错误：返回统一格式，避免前端崩溃
    console.error("服务异常：", error);
    return new Response(JSON.stringify({ success: false }), {
      headers: { "Content-Type": "application/json" }, status: 500
    });
  }
}
