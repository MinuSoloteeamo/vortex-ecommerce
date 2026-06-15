export const metadata = {
  title: 'VORTEX Shipper Portal',
};

export default function ShipperLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', paddingBottom: '80px' }}>
      <header style={{ background: '#1e293b', padding: '16px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#38bdf8' }}>🚀 VORTEX Shipper Portal</h1>
      </header>
      <main style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
