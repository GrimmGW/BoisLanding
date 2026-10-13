import HeroSection from "./components/HeroSection";
import TournamentsSection from "./components/TournamentsSection";
import AboutSection from "./components/AboutSection";
import GallerySection from "./components/GallerySection";
import ContactSection from "./components/ContactSection";
import FooterSection from "./components/FooterSection";
import NotificationPrompt from "./components/NotificationPrompt";
import { NotificationsProvider } from "./notifications/NotificationsContext";

function App() {
  return (
    <NotificationsProvider>
      <HeroSection />
      <TournamentsSection />
      <AboutSection />
      <GallerySection />
      <ContactSection />
      <FooterSection />
      <NotificationPrompt />
    </NotificationsProvider>
  );
}

export default App;
