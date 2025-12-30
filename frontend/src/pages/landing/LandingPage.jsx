import { Button } from "@/components/ui/button";
import HeroSection from "../../components/layout/hero-section";
import Features from "@/components/features-2";

function LandingPage() {
	return (
		// <div className="flex min-h-svh flex-col items-center justify-center">
		<div>
			<HeroSection />
			<Features />
		</div>
	);
}

export default LandingPage;
