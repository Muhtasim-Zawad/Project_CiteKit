import { Button } from "@/components/ui/button";
import HeroSection from "../../components/layout/hero-section";
import Features from "@/components/features-2";
import TeamSection from "@/components/team";

function LandingPage() {
	return (
		// <div className="flex min-h-svh flex-col items-center justify-center">
		<div>
			<HeroSection />
			<Features />
			<TeamSection />
		</div>
	);
}

export default LandingPage;
