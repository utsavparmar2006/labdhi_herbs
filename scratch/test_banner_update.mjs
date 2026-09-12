async function testSettings() {
  // Login to get admin token
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'support@labdhiherbs.com', password: 'Admin@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken || loginData.token;
  console.log('Login token received:', !!token);

  if (!token) return;

  // Update banners with authentic images
  const sampleBanners = [
    {
      id: 'banner-1',
      title: '100% Pure Botanical Formulations',
      subtitle: 'Handcrafted in Surat, Gujarat',
      image: 'https://labdhiherbs.com/uploads/banners/banner-7127.jpg',
      link: '/shop',
      isActive: true,
      order: 1,
    },
    {
      id: 'banner-2',
      title: 'Authentic Ayurvedic Hair & Skin Care',
      subtitle: 'Zero Chemicals, Pure Potency',
      image: 'https://labdhiherbs.com/uploads/banners/banner-9838.jpg',
      link: '/shop',
      isActive: true,
      order: 2,
    },
    {
      id: 'banner-3',
      title: 'Pain Relief & Herbal Balms',
      subtitle: 'Time-tested Gujarati Herbal Wisdom',
      image: 'https://labdhiherbs.com/uploads/banners/banner-2050.jpg',
      link: '/shop',
      isActive: true,
      order: 3,
    }
  ];

  const putRes = await fetch('http://localhost:5000/api/v1/site-settings/banners', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(sampleBanners)
  });
  const putData = await putRes.json();
  console.log('Update banners response:', putData.success, putData.message);

  // Verify fetch
  const getRes = await fetch('http://localhost:5000/api/v1/site-settings');
  const getData = await getRes.json();
  console.log('Current stored banners count:', getData.data?.banners?.length);
}

testSettings();
