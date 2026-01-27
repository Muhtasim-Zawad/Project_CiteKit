import { Button } from "@/components/ui/button";
import HeroSection from "../../components/layout/hero-section";
import Features from "@/components/features-2";
import TeamSection from "@/components/team";
import FAQsTwo from "@/components/faqs-2";
import Pricing from "@/components/pricing";
import CallToAction from "@/components/call-to-action";
import FooterSection from "@/components/footer";

function LandingPage() {
	return (
		<div>
			<HeroSection />
			<Features />
			<TeamSection />
			<FAQsTwo />
			<Pricing />
			<CallToAction />
			<FooterSection />
		</div>
	);
}

export default LandingPage;
