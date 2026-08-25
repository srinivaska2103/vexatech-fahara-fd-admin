export default function manifest() {
  return {
    name: 'Fahara Admin Management Suite',
    short_name: 'Fahara Admin',
    description: 'Fahara Admin Web Application & Vendor Management Suite',
    start_url: '/admin/dashboard',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#3D2B1F',
    icons: [
      {
        src: '/Fahara Logo.jpeg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/Fahara Logo.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
