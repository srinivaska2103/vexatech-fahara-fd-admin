export default function manifest() {
  return {
    name: 'Grab2GO Admin Management Suite',
    short_name: 'Grab2GO Admin',
    description: 'Grab2GO Admin Web Application & Vendor Management Suite',
    start_url: '/admin/dashboard',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#3D2B1F',
    icons: [
      {
        src: '/grab-it-logo.png',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/grab-it-logo.png',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
