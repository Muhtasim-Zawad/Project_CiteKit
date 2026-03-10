import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PaperDetailsModal from "@/components/paper-details-modal";
import api from "@/api";

export default function SavedPapersPanel({ projectId }) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPaper, setSelectedPaper] = useState(null);
	const [savedPapers, setSavedPapers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchPapers = async () => {
			if (!projectId) {
				setSavedPapers([]);
				return;
			}

			setLoading(true);
			setError(null);
			try {
				const response = await api.get(`/projects/${projectId}/references`);
				setSavedPapers(response.data || []);
			} catch (err) {
				console.error("Error fetching papers:", err);
				setError(err.response?.data?.detail || "Failed to load saved papers");
				setSavedPapers([]);
			} finally {
				setLoading(false);
			}
		};

		fetchPapers();
	}, [projectId]);

	if (!projectId) {
		return (
			<div className="h-full flex flex-col bg-background border-l items-center justify-center">
				<p className="text-muted-foreground">No project selected</p>
			</div>
		);
	}

	return (
		<>
			<div className="h-full flex flex-col bg-background border-l">
				{/* Header with Badge */}
				<div className="p-4 border-b">
					<Badge variant="secondary" className="text-sm">
						Saved Papers
					</Badge>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-muted-foreground">Loading papers...</p>
					</div>
				)}

				{/* Error State */}
				{error && !loading && (
					<div className="flex-1 flex flex-col items-center justify-center p-4">
						<p className="text-red-500 text-sm text-center">{error}</p>
					</div>
				)}

				{/* Papers List */}
				{!loading && !error && savedPapers.length === 0 && (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-muted-foreground text-center">
							No saved papers yet
						</p>
					</div>
				)}

				{!loading && !error && savedPapers.length > 0 && (
					<div className="flex-1 overflow-y-auto">
						<div className="p-4 space-y-4">
							{savedPapers.map((paper) => (
								<Card
									key={paper.doi}
									onClick={() => {
										setSelectedPaper(paper);
										setIsModalOpen(true);
									}}
									className="p-4 cursor-pointer hover:shadow-md transition-shadow"
								>
									<div className="space-y-3">
										{/* Title */}
										<h3 className="font-semibold text-sm line-clamp-2 hover:text-primary">
											{paper.title || "Untitled"}
										</h3>

										{/* Author */}
										<p className="text-xs text-muted-foreground">
											{paper.author || "Unknown Author"}
										</p>

										{/* Abstract */}
										<p className="text-xs text-muted-foreground line-clamp-3">
											{paper.abstract || "No abstract available"}
										</p>

										{/* Score Badge */}
										{paper.score && (
											<div className="flex items-center gap-2 pt-1">
												<Badge
													variant="outline"
													className="text-xs bg-blue-50 text-blue-700 border-blue-200"
												>
													Score: {paper.score.toFixed(2)}
												</Badge>
											</div>
										)}

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
				)}
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
