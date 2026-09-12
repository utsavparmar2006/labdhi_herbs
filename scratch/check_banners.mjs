const res = await fetch('https://labdhiherbs.com');
const text = await res.text();
const idx = text.indexOf('owl-carousel-16');
if (idx !== -1) {
  console.log('BEFORE:');
  console.log(text.substring(Math.max(0, idx - 600), idx));
}
