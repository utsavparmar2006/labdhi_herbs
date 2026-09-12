async function checkUrl(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    console.log(url, 'Status:', res.status, 'Length:', html.length);
    // Find title or h1 or main content
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    console.log('Title:', titleMatch ? titleMatch[1].trim() : 'none', '| H1:', h1Match ? h1Match[1].trim() : 'none');
  } catch (e) {
    console.error(url, e.message);
  }
}

await checkUrl('https://labdhiherbs.com/Aboutus');
await checkUrl('https://labdhiherbs.com/Terms_condition');
await checkUrl('https://labdhiherbs.com/Privacy_Policy');
await checkUrl('https://labdhiherbs.com/Refund_Policy');
await checkUrl('https://labdhiherbs.com/Shipping_policy');
await checkUrl('https://labdhiherbs.com/Faq');
