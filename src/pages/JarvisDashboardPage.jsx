import JarvisNav from '../components/JarvisNav';
import JarvisDashboard from '../components/JarvisDashboard';

/**
 * Page Dashboard JARVIS
 */
export default function JarvisDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <JarvisNav />
      <JarvisDashboard />
    </div>
  );
}
