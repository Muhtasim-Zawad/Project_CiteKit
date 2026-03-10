import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PaperDetailsModal from "@/components/paper-details-modal";

export default function SavedPapersPanel() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPaper, setSelectedPaper] = useState(null);

	// Sample data - replace with actual data from your backend
	const savedPapers = [
		{
			id: 1,
			title: "Machine Learning in Healthcare: A Comprehensive Survey",
			author: "John Smith, Jane Doe",
			abstract:
				"This paper provides a comprehensive overview of machine learning applications in healthcare, covering diagnosis, treatment planning, and drug discovery.",
		},
		{
			id: 2,
			title: "Transformer Models: Beyond BERT",
			author: "Alice Johnson",
			abstract:
				"An in-depth exploration of advanced transformer architectures and their applications in natural language processing and beyond.",
		},
		{
			id: 3,
			title: "Quantum Computing: Current State and Future Prospects",
			author: "Bob Wilson, Carol Davis",
			abstract:
				"A detailed analysis of quantum computing technologies, their current implementations, and potential future applications.",
		},
		{
			id: 4,
			title: "Sustainable AI: Reducing Environmental Impact",
			author: "Emma Brown",
			abstract:
				"Explores methods and strategies for creating more environmentally sustainable AI systems and reducing their carbon footprint.",
		},
	];

	return (
		<>
			<div className="h-full flex flex-col bg-background border-l">
				{/* Header with Badge */}
				<div className="p-4 border-b">
					<Badge variant="secondary" className="text-sm">
						Saved Papers
					</Badge>
				</div>

				{/* Papers List */}
				<div className="flex-1 overflow-y-auto">
					<div className="p-4 space-y-4">
						{savedPapers.map((paper) => (
							<Card
								key={paper.id}
								onClick={() => {
									setSelectedPaper(paper);
									setIsModalOpen(true);
								}}
								className="p-4 cursor-pointer hover:shadow-md transition-shadow"
							>
								<div className="space-y-3">
									{/* Title */}
									<h3 className="font-semibold text-sm line-clamp-2 hover:text-primary">
										{paper.title}
									</h3>

									{/* Author */}
									<p className="text-xs text-muted-foreground">
										{paper.author}
									</p>

									{/* Abstract */}
									<p className="text-xs text-muted-foreground line-clamp-3">
										{paper.abstract}
									</p>

									{/* Buttons */}
									<div className="flex justify-end gap-2 pt-2">
										<Button
											variant="outline"
											size="sm"
											className="h-7 text-xs"
											onClick={(e) => {
												e.stopPropagation();
												setSelectedPaper(paper);
												setIsModalOpen(true);
											}}
										>
											Refs
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="h-7 text-xs"
											onClick={(e) => {
												e.stopPropagation();
												setSelectedPaper(paper);
												setIsModalOpen(true);
											}}
										>
											Cited By
										</Button>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</div>

			<PaperDetailsModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				selectedPaper={selectedPaper}
				allPapers={savedPapers}
				onSelectPaper={(paper) => setSelectedPaper(paper)}
			/>
		</>
	);
}
