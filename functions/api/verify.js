// 明文密码验证版：直接比对环境变量中的明文密码
export async function onRequestPost(context) {
  try {
    // 1. 解析前端请求（siteKey + 用户输入的明文密码）
    const { siteKey, password } = await context.request.json();
    if (!siteKey || !password) {
      return new Response(JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" },
        status: 400
      });
    }

    // 2. 网站标识 ↔ 环境变量名映射（变量名统一为“网站标识+_PASSWORD”）
    const SITE_ENV_MAP = {
      // 常用工具
      "baidu": "BAIDU_PASSWORD",
      "google": "GOOGLE_PASSWORD",
      "github": "GITHUB_PASSWORD",
      "codepen": "CODEPEN_PASSWORD",
      // 视频平台
      "bilibili": "BILIBILI_PASSWORD",
      "youku": "YOUKU_PASSWORD",
      "iqiyi": "IQIYI_PASSWORD",
      "youtube": "YOUTUBE_PASSWORD",
      "tencent": "TENCENT_PASSWORD",
      // 社交网络
      "weixin": "WEIXIN_PASSWORD",
      "weibo": "WEIBO_PASSWORD",
      "douyin": "DOUYIN_PASSWORD",
      "kuaishou": "KUAIHOU_PASSWORD",
      // 在线音乐
      "neteaseMusic": "NETEASE_MUSIC_PASSWORD",
      "qqMusic": "QQ_MUSIC_PASSWORD",
      "kugouMusic": "KUGOU_MUSIC_PASSWORD",
      "kuwoMusic": "KUWO_MUSIC_PASSWORD",
      "xiamiMusic": "XIAMI_MUSIC_PASSWORD",
      "spotify": "SPOTIFY_PASSWORD",
      // 邮箱平台
      "neteaseMail": "NETEASE_MAIL_PASSWORD",
      "qqMail": "QQ_MAIL_PASSWORD",
      "gmail": "GMAIL_PASSWORD",
      "outlook": "OUTLOOK_PASSWORD",
      "sinaMail": "SINA_MAIL_PASSWORD",
      "sohuMail": "SOHU_MAIL_PASSWORD",
      // 学习平台
      "icourse": "ICOURESE_PASSWORD",
      "coursera": "COURSERA_PASSWORD",
      "neteaseClass": "NETEASE_CLASS_PASSWORD",
      "baijiajiangtan": "BAIJIA_PASSWORD"
    };

    // 3. 检查siteKey是否有效，获取对应的环境变量名
    const envVarName = SITE_ENV_MAP[siteKey];
    if (!envVarName) {
      return new Response(JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" },
        status: 400
      });
    }

    // 4. 从环境变量获取明文密码（直接读取，无需哈希）
    const correctPassword = context.env[envVarName];
    if (!correctPassword) { // 未配置该网站的密码变量
      return new Response(JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" },
        status: 500
      });
    }

    // 5. 直接比对明文密码（核心简化步骤）
    return new Response(JSON.stringify({
      success: password === correctPassword // 明文相等即验证通过
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
}
