// 后端验证逻辑：仅在Cloudflare服务器执行，哈希值从环境变量读取
export async function onRequestPost(context) {
  try {
    // 1. 解析前端请求数据
    const requestData = await context.request.json();
    const { siteKey, password } = requestData;
    
    // 校验参数完整性
    if (!siteKey || !password) {
      return new Response(JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" },
        status: 400
      });
    }

    // 2. 网站标识与环境变量的映射关系（关键：哈希值存储在环境变量中）
    const SITE_ENV_MAP = {
      // 常用工具
      "baidu": "BAIDU_HASH",
      "google": "GOOGLE_HASH",
      "github": "GITHUB_HASH",
      "codepen": "CODEPEN_HASH",
      
      // 视频平台
      "bilibili": "BILIBILI_HASH",
      "youku": "YOUKU_HASH",
      "iqiyi": "IQIYI_HASH",
      "youtube": "YOUTUBE_HASH",
      "tencent": "TENCENT_HASH",
      
      // 社交网络
      "weixin": "WEIXIN_HASH",
      "weibo": "WEIBO_HASH",
      "douyin": "DOUYIN_HASH",
      "kuaishou": "KUAIHOU_HASH",
      
      // 在线音乐
      "neteaseMusic": "NETEASE_MUSIC_HASH",
      "qqMusic": "QQ_MUSIC_HASH",
      "kugouMusic": "KUGOU_MUSIC_HASH",
      "kuwoMusic": "KUWO_MUSIC_HASH",
      "xiamiMusic": "XIAMI_MUSIC_HASH",
      "spotify": "SPOTIFY_HASH",
      
      // 邮箱平台
      "neteaseMail": "NETEASE_MAIL_HASH",
      "qqMail": "QQ_MAIL_HASH",
      "gmail": "GMAIL_HASH",
      "outlook": "OUTLOOK_HASH",
      "sinaMail": "SINA_MAIL_HASH",
      "sohuMail": "SOHU_MAIL_HASH",
      
      // 学习平台
      "icourse": "ICOURESE_HASH",
      "coursera": "COURSERA_HASH",
      "neteaseClass": "NETEASE_CLASS_HASH",
      "baijiajiangtan": "BAIJIA_HASH"
    };

    // 3. 检查siteKey是否有效
    const envVarName = SITE_ENV_MAP[siteKey];
    if (!envVarName) {
      return new Response(JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" },
        status: 400
      });
    }

    // 4. 从环境变量获取正确的哈希值（哈希值在此处注入，源码中无暴露）
    const correctHash = context.env[envVarName];
    if (!correctHash) {
      return new Response(JSON.stringify({ success: false }), {
        headers: { "Content-Type": "application/json" },
        status: 500
      });
    }

    // 5. 计算用户输入密码的SHA-256哈希
    const inputHash = await sha256(password);

    // 6. 比对哈希并返回结果
    return new Response(JSON.stringify({
      success: inputHash === correctHash
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    // 捕获所有异常，返回验证失败
    return new Response(JSON.stringify({ success: false }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
}

// SHA-256哈希计算工具函数
async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}