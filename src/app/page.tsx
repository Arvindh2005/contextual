export default function Home() {
  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Sidebar */}
      <aside className="w-64 bg-base-100 p-4 shadow-md">
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        <ul className="menu">
          <li>
            <a className="active">Home</a>
          </li>
          <li>
            <a>Analytics</a>
          </li>
          <li>
            <a>Settings</a>
          </li>
          <li>
            <a>Profile</a>
          </li>
        </ul>
      </aside>

      <div className="flex-1">
        <nav className="navbar bg-base-100 shadow-md">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">My App</a>
          </div>
          <div className="flex-none">
            <button className="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </button>
          </div>
        </nav>

        <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-primary text-primary-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Users</h2>
              <p>Manage all your users here.</p>
              <div className="card-actions justify-end">
                <button className="btn">View</button>
              </div>
            </div>
          </div>

          <div className="card bg-secondary text-secondary-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Analytics</h2>
              <p>View real-time analytics.</p>
              <div className="card-actions justify-end">
                <button className="btn">Check</button>
              </div>
            </div>
          </div>

          <div className="card bg-accent text-accent-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Settings</h2>
              <p>Configure system settings.</p>
              <div className="card-actions justify-end">
                <button className="btn">Edit</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
