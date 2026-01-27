import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";

const MOCK_RESOURCES = [
	{
		id: 1,
		title: "Advanced Machine Learning Techniques",
		description:
			"A comprehensive guide to modern machine learning approaches and their applications in real-world scenarios.",
		year: 2024,
		authors: ["Dr. Sarah Chen", "Prof. James Wilson"],
		color: "bg-amber-50 text-amber-700 border-amber-200",
	},
	{
		id: 2,
		title: "Quantum Computing Fundamentals",
		description:
			"Explore the principles of quantum mechanics and their application to computational problems.",
		year: 2023,
		authors: ["Dr. Michael Torres"],
		color: "bg-green-50 text-green-700 border-green-200",
	},
	{
		id: 3,
		title: "Neural Networks in Production",
		description:
			"Best practices for deploying and maintaining neural networks in production environments.",
		year: 2024,
		authors: ["Emma Rodriguez", "David Kim"],
		color: "bg-blue-50 text-blue-700 border-blue-200",
	},
	{
		id: 4,
		title: "Blockchain Technology Overview",
		description:
			"Understanding distributed ledger technology and its various applications beyond cryptocurrency.",
		year: 2023,
		authors: ["Prof. Alex Kumar"],
		color: "bg-pink-50 text-pink-700 border-pink-200",
	},
	{
		id: 5,
		title: "Data Privacy and Security",
		description:
			"Modern approaches to protecting sensitive data and ensuring compliance with international standards.",
		year: 2024,
		authors: ["Lisa Anderson", "Marcus Johnson", "Rachel Lee"],
		color: "bg-purple-50 text-purple-700 border-purple-200",
	},
	{
		id: 6,
		title: "Cloud Architecture Patterns",
		description:
			"Design patterns and best practices for building scalable cloud-native applications.",
		year: 2023,
		authors: ["Dr. Robert Zhang"],
		color: "bg-cyan-50 text-cyan-700 border-cyan-200",
	},
	{
		id: 7,
		title: "Edge Computing Applications",
		description:
			"Leveraging edge computing for low-latency and offline-capable applications.",
		year: 2024,
		authors: ["Jennifer White", "Carlos Martinez"],
		color: "bg-rose-50 text-rose-700 border-rose-200",
	},
];

export function Resources() {
	return (
		<div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			{MOCK_RESOURCES.map((resource) => (
				<Card
					key={resource.id}
					className="group relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-background backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:from-primary/10 hover:via-card hover:to-background border border-border/50"
				>
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-bold leading-tight line-clamp-2 text-foreground">
							{resource.title}
						</CardTitle>
						<div className="flex items-center gap-2 mt-2">
							<span
								className={`px-2 py-1 text-xs font-semibold rounded-md ${resource.color}`}
							>
								{resource.year}
							</span>
						</div>
					</CardHeader>
					<CardContent className="pb-4">
						<p className="text-sm text-muted-foreground line-clamp-4 mb-3">
							{resource.description}
							{resource.description.length > 120 ? "..." : ""}
						</p>
						<div className="flex flex-wrap gap-1.5">
							{resource.authors.map((author) => (
								<Badge
									key={author}
									variant="outline"
									className={`text-xs font-normal ${resource.color}`}
								>
									{author}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
