import { MapPin, Phone, Mail, Building2, Navigation, Clock } from 'lucide-react'

const BRANCHES = [
  {
    name: 'Main Branch',
    location: 'Tagum City',
    address: 'Tagum City, Davao del Norte, Philippines',
    phone: '+63 912 000 0001',
    email: 'mainbranch@terrava.ph',
    hours: 'Monday - Saturday: 8:00 AM - 5:00 PM',
    lat: 7.4478,
    lng: 125.8070,
  },
  {
    name: '2nd Branch',
    location: 'Panabo City',
    address: 'Panabo City, Davao del Norte, Philippines',
    phone: '+63 912 000 0002',
    email: '2ndbranch@terrava.ph',
    hours: 'Monday - Saturday: 8:00 AM - 5:00 PM',
    lat: 7.3097,
    lng: 125.6839,
  },
  {
    name: '3rd Branch',
    location: 'Sto. Tomas',
    address: 'Sto. Tomas, Davao del Norte, Philippines',
    phone: '+63 912 000 0003',
    email: '3rdbranch@terrava.ph',
    hours: 'Monday - Saturday: 8:00 AM - 5:00 PM',
    lat: 7.1827,
    lng: 125.6359,
  },
  {
    name: '4th Branch',
    location: 'Davao City',
    address: 'Davao City, Davao del Sur, Philippines',
    phone: '+63 912 000 0004',
    email: '4thbranch@terrava.ph',
    hours: 'Monday - Saturday: 8:00 AM - 5:00 PM',
    lat: 7.0707,
    lng: 125.6087,
  },
  {
    name: '5th Branch',
    location: 'Mati City',
    address: 'Mati City, Davao Oriental, Philippines',
    phone: '+63 912 000 0005',
    email: '5thbranch@terrava.ph',
    hours: 'Monday - Saturday: 8:00 AM - 5:00 PM',
    lat: 6.9529,
    lng: 126.2169,
  },
  {
    name: '6th Branch',
    location: 'Digos City',
    address: 'Digos City, Davao del Sur, Philippines',
    phone: '+63 912 000 0006',
    email: '6thbranch@terrava.ph',
    hours: 'Monday - Saturday: 8:00 AM - 5:00 PM',
    lat: 6.7494,
    lng: 125.3572,
  },
]

export default function Branches() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Our Branches</h1>
        <p className="text-gray-500 mt-1">
          Find the nearest Terrava branch to visit a seller in person and start your land transaction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {BRANCHES.map((b, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-brand-600 p-3 rounded-xl flex-shrink-0 shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{b.name}</h2>
                <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full mt-1">
                  {b.location}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5 text-gray-600">
                <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>{b.address}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-600">
                <Phone className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <a href={`tel:${b.phone}`} className="hover:text-brand-700 transition">{b.phone}</a>
              </div>
              <div className="flex items-center gap-2.5 text-gray-600">
                <Mail className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <a href={`mailto:${b.email}`} className="hover:text-brand-700 transition break-all">{b.email}</a>
              </div>
              <div className="flex items-start gap-2.5 text-gray-600">
                <Clock className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>{b.hours}</span>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 border border-brand-200 hover:bg-brand-50 px-4 py-2 rounded-xl transition"
            >
              <Navigation className="w-4 h-4" /> Get Directions
            </a>
          </div>
        ))}
      </div>

      <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 text-center">
        <Building2 className="w-8 h-8 text-brand-600 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">Can't find a branch near you?</h3>
        <p className="text-sm text-gray-500">Contact our main office and we'll connect you with the nearest available seller.</p>
        <a
          href="mailto:info@terrava.ph"
          className="inline-flex items-center gap-2 mt-4 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 transition"
        >
          <Mail className="w-4 h-4" /> Contact Main Office
        </a>
      </div>
    </div>
  )
}
