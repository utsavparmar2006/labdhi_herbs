// Login to old admin and extract setting values
async function run() {
  const loginUrl = 'https://labdhiherbs.com/Admin_login';
  
  // 1. Get initial cookie
  const r1 = await fetch(loginUrl);
  const setCookie = r1.headers.get('set-cookie');
  let cookie = '';
  if (setCookie) {
    cookie = setCookie.split(';')[0];
  }

  // 2. Post credentials
  const params = new URLSearchParams();
  params.append('email', 'support@labdhiherbs.com');
  params.append('password', 'Admin@123');
  params.append('submit', 'Login');

  const r2 = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookie,
    },
    body: params.toString(),
    redirect: 'manual',
  });

  const cookie2 = r2.headers.get('set-cookie') || cookie;
  const authCookie = cookie2.split(';')[0];
  console.log('Auth status:', r2.status, 'Cookie:', authCookie);

  // 3. Inspect setting pages
  const urls = [
    'https://labdhiherbs.com/Setting_master/Aboutus',
    'https://labdhiherbs.com/Setting_master/Terms_Conditions',
    'https://labdhiherbs.com/Setting_master/Privacy_Policy',
    'https://labdhiherbs.com/Setting_master/Refund_Policy',
    'https://labdhiherbs.com/Setting_master/Shipping_policy',
    'https://labdhiherbs.com/Faq_management',
    'https://labdhiherbs.com/Setting_master/copyright_Policy',
    'https://labdhiherbs.com/Setting_master/Logo',
    'https://labdhiherbs.com/Setting_master/banners',
    'https://labdhiherbs.com/Setting_master/Site_setting',
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: { 'Cookie': authCookie },
      });
      const html = await res.text();
      // Extract textarea content or input values
      console.log('---', u.split('/').pop(), '---');
      const textareas = [...html.matchAll(/<textarea[^>]*>([\s\S]*?)<\/textarea>/gi)].map(m => m[1].trim());
      const inputs = [...html.matchAll(/<input[^>]+name="([^"]+)"[^>]*value="([^"]*)"/gi)].map(m => `${m[1]}=${m[2]}`);
      if (textareas.length > 0) console.log('Textareas:', textareas.map(t => t.substring(0, 100)));
      if (inputs.length > 0) console.log('Inputs:', inputs.slice(0, 10));
    } catch (e) {
      console.error(u, e.message);
    }
  }
}

run();
