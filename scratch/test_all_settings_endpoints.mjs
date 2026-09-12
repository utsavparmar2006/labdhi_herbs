async function testAllSettings() {
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@labdhiherbs.com', password: 'Admin@123456' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  console.log('✅ Admin authenticated:', !!token);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 1. Profile
  const profileRes = await fetch('http://localhost:5000/api/v1/site-settings/profile', {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      adminName: 'Labdhi Admin',
      adminEmail: 'support@labdhiherbs.com',
      adminPhone: '+91 93283 49328',
      address: '40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009',
      country: 'India',
      state: 'Gujarat',
      city: 'Surat',
      facebook: 'https://www.facebook.com/Roopotkarsh-Vilepan-106128397412060/?ref=pages_you_manage',
      instagram: 'https://www.instagram.com/labdhiherbs/',
      youtube: '',
      twitter: ''
    })
  });
  console.log('1. Profile update:', (await profileRes.json()).success);

  // 2. About
  const aboutRes = await fetch('http://localhost:5000/api/v1/site-settings/about', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content: '<p>Labdhi Herbs Surat handcrafted botanical Ayurveda.</p>' })
  });
  console.log('2. About Us update:', (await aboutRes.json()).success);

  // 3. Terms
  const termsRes = await fetch('http://localhost:5000/api/v1/site-settings/policy/termsAndConditions', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content: '<h2>Terms & Conditions</h2><p>Official verified terms for Labdhi Herbs.</p>' })
  });
  console.log('3. Terms update:', (await termsRes.json()).success);

  // 4. Privacy
  const privRes = await fetch('http://localhost:5000/api/v1/site-settings/policy/privacyPolicy', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content: '<h2>Privacy Policy</h2><p>Customer data is strictly safeguarded.</p>' })
  });
  console.log('4. Privacy update:', (await privRes.json()).success);

  // 5. Refund
  const refRes = await fetch('http://localhost:5000/api/v1/site-settings/policy/refundPolicy', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content: '<h2>Refund Policy</h2><p>Hassle-free 7-day returns for damaged products.</p>' })
  });
  console.log('5. Refund update:', (await refRes.json()).success);

  // 6. Shipping
  const shipRes = await fetch('http://localhost:5000/api/v1/site-settings/policy/shippingPolicy', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content: '<h2>Shipping Policy</h2><p>Dispatched from Surat within 24-48 hours.</p>' })
  });
  console.log('6. Shipping update:', (await shipRes.json()).success);

  // 7. FAQ
  const faqRes = await fetch('http://localhost:5000/api/v1/site-settings/faq', {
    method: 'PUT',
    headers,
    body: JSON.stringify([
      {
        question: 'Are Labdhi Herbs products 100% chemical-free?',
        answer: 'Yes, crafted exclusively from natural botanicals in Surat, Gujarat.',
        order: 1,
        isActive: true
      },
      {
        question: 'How long does delivery take?',
        answer: 'Delivery takes 3 to 7 business days across India.',
        order: 2,
        isActive: true
      }
    ])
  });
  console.log('7. FAQ update:', (await faqRes.json()).success);

  // 8. Copyright
  const copyRes = await fetch('http://localhost:5000/api/v1/site-settings/copyright', {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      copyrightText: '© 2026 Labdhi Herbs. All rights reserved.',
      copyrightYear: 2026
    })
  });
  console.log('8. Copyright update:', (await copyRes.json()).success);

  // 9. Logos
  const logoRes = await fetch('http://localhost:5000/api/v1/site-settings/logos', {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      logoLight: 'https://labdhiherbs.com/uploads/logo/Main-logo-531.jpg',
      logoDark: 'https://labdhiherbs.com/uploads/logo/Main-logo-531.jpg',
      favicon: 'https://labdhiherbs.com/uploads/logo/Tab-logo-417.jpg'
    })
  });
  console.log('9. Logo & Favicon update:', (await logoRes.json()).success);

  // 10. Banners
  const bannerRes = await fetch('http://localhost:5000/api/v1/site-settings/banners', {
    method: 'PUT',
    headers,
    body: JSON.stringify([
      {
        id: 'banner-1',
        title: '100% Pure Botanical Formulations',
        subtitle: 'Handcrafted in Surat, Gujarat',
        image: 'https://labdhiherbs.com/uploads/banners/banner-7127.jpg',
        link: '/shop',
        isActive: true,
        order: 1
      },
      {
        id: 'banner-2',
        title: 'Authentic Ayurvedic Hair & Skin Care',
        subtitle: 'Zero Chemicals, Pure Potency',
        image: 'https://labdhiherbs.com/uploads/banners/banner-9838.jpg',
        link: '/shop',
        isActive: true,
        order: 2
      }
    ])
  });
  console.log('10. Banners update:', (await bannerRes.json()).success);

  // 11. General & System Settings
  const genRes = await fetch('http://localhost:5000/api/v1/site-settings/general', {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      siteName: 'Labdhi Herbs',
      siteTagline: 'Pure Ayurvedic Formulations from Surat, Gujarat',
      supportEmail: 'support@labdhiherbs.com',
      supportPhone: '+91 93283 49328',
      whatsappNumber: '+919328349328',
      address: '40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395009',
      googleMapsLink: '',
      social: {
        facebook: 'https://www.facebook.com/Roopotkarsh-Vilepan-106128397412060/?ref=pages_you_manage',
        instagram: 'https://www.instagram.com/labdhiherbs/',
        twitter: '',
        youtube: ''
      },
      maintenanceMode: false,
      gstEnabled: true,
      igst: 18,
      cgst: 9,
      sgst: 9,
      userLoginEnabled: true,
      paymentMode: 'both',
      reviewManagementEnabled: true,
      blogManagementEnabled: true,
      metaTitle: 'Labdhi Herbs – Pure Ayurvedic Formulations from Surat',
      metaDescription: '100% natural Ayurvedic formulations handcrafted in Surat, Gujarat.',
      metaKeywords: 'Ayurvedic herbs, herbal products, natural skincare, hair care, Surat'
    })
  });
  console.log('11. Site & System Settings update:', (await genRes.json()).success);
}

testAllSettings();
