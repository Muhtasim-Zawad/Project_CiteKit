import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputTextarea,
	PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { MessageSquare, BookOpen, Quote, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "@/api";
import { useView } from "@/context/ViewContext";

// Paper Card Component
const PaperCard = ({ paper, onSelect, onSave, isSaving }) => {
	const truncatedAbstract =
		paper.abstract && paper.abstract.length > 120
			? paper.abstract.substring(0, 120) + "..."
			: paper.abstract || "No abstract available";

	return (
		<div className="group relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-background backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:from-primary/10 border border-primary/20 rounded-lg p-4 cursor-pointer">
			<div className="space-y-3">
				<div>
					<h3 className="font-bold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
						{paper.title || "Untitled"}
					</h3>
					{paper.year && (
						<Badge className="mt-2 bg-primary/10 text-primary border-primary/20">
							{paper.year}
						</Badge>
					)}
				</div>

				<p className="text-xs text-muted-foreground line-clamp-3">
					{truncatedAbstract}
				</p>

				{paper.score && (
					<div className="flex items-center gap-2 mb-2">
						<Badge
							variant="outline"
							className="text-xs bg-green-50 text-green-700 border-green-200"
						>
							Relevance: {paper.score.toFixed(2)}
						</Badge>
					</div>
				)}

				<div className="flex gap-2 pt-2">
					<Button
						size="xs"
						variant="ghost"
						className="h-7 text-xs hover:bg-primary/10 hover:text-primary"
						onClick={(e) => {
							e.stopPropagation();
							onSelect?.(paper);
						}}
					>
						<BookOpen className="h-3 w-3 mr-1" /> View
					</Button>
					<Button
						className="h-7 ml-auto bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1 text-xs disabled:opacity-50"
						disabled={isSaving}
						onClick={(e) => {
							e.stopPropagation();
							onSave?.(paper);
						}}
					>
						{isSaving ? (
							<>
								<Loader2 className="h-3 w-3 mr-1 animate-spin" />
								Saving...
							</>
						) : (
							"+ Save"
						)}
					</Button>
				</div>
			</div>
		</div>
	);
};

// Paper Modal Component
const PaperModal = ({ paper, isOpen, onClose }) => {
	if (!paper) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				showCloseButton={false}
				className="w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto via-card bg-background"
			>
				<div className="space-y-6 py-4">
					<DialogHeader className="space-y-4">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1">
								<DialogTitle className="text-2xl font-bold text-foreground">
									{paper.title || "Untitled"}
								</DialogTitle>
								{paper.year && (
									<Badge className="mt-3 bg-primary/10 text-primary border-primary/20 text-sm">
										{paper.year}
									</Badge>
								)}
							</div>
							<DialogClose asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
								>
									<X className="h-4 w-4" />
								</Button>
							</DialogClose>
						</div>
					</DialogHeader>

					{/* Author */}
					{paper.author && (
						<div>
							<h3 className="text-sm font-semibold text-foreground mb-2">
								Author
							</h3>
							<p className="text-sm text-muted-foreground">{paper.author}</p>
						</div>
					)}

					{/* Abstract Section */}
					{paper.abstract && (
						<div>
							<h3 className="text-sm font-semibold text-foreground mb-2">
								Abstract
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed bg-primary/5 rounded-lg p-4 border border-primary/10">
								{paper.abstract}
							</p>
						</div>
					)}

					{/* Stats Section */}
					{(paper.score || paper.critic_reasoning) && (
						<div className="grid grid-cols-2 gap-4">
							{paper.score && (
								<div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
									<p className="text-xs text-muted-foreground font-medium">
										Relevance Score
									</p>
									<p className="text-xl font-bold text-primary mt-1">
										{paper.score.toFixed(2)}
									</p>
								</div>
							)}
							{paper.year && (
								<div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
									<p className="text-xs text-muted-foreground font-medium">
										Published
									</p>
									<p className="text-xl font-bold text-primary mt-1">
										{paper.year}
									</p>
								</div>
							)}
						</div>
					)}

					{paper.critic_reasoning && (
						<div>
							<h3 className="text-sm font-semibold text-foreground mb-2">
								Analysis Notes
							</h3>
							<p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 border border-muted">
								{paper.critic_reasoning}
							</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4 border-t border-primary/10">
						{paper.download_url && (
							<Button
								className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
								onClick={() => window.open(paper.download_url, "_blank")}
							>
								<BookOpen className="h-4 w-4 mr-2" /> View Paper
							</Button>
						)}
						<Button variant="outline" className="flex-1">
							<Quote className="h-4 w-4 mr-2" /> Citations
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

// Paper Results Component
const PaperResults = ({ papers, onSavePaper, savingDois = new Set() }) => {
	const [selectedPaper, setSelectedPaper] = useState(null);

	return (
		<>
			<div className="grid grid-cols-1 gap-3 py-2 max-w-4xl">
				{papers.map((paper) => (
					<PaperCard
						key={paper.doi}
						paper={paper}
						onSelect={setSelectedPaper}
						onSave={onSavePaper}
						isSaving={savingDois.has(paper.doi)}
					/>
				))}
			</div>
			<PaperModal
				paper={selectedPaper}
				isOpen={!!selectedPaper}
				onClose={() => setSelectedPaper(null)}
			/>
		</>
	);
};

const ConversationDemo = () => {
	const { projectId } = useParams();
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState([]);
	const [status, setStatus] = useState("ready");
	const [threadId, setThreadId] = useState(null);
	const [saving, setSaving] = useState(false);
	const [savingDois, setSavingDois] = useState(new Set());
	const [error, setError] = useState(null);
	const [isLoadingThread, setIsLoadingThread] = useState(false);
	const textareaRef = useRef(null);
	const { selectedThreadId, setSelectedThreadId } = useView();

	// Load thread when selected from sidebar
	useEffect(() => {
		const loadSelectedThread = async () => {
			if (!selectedThreadId) {
				// No thread selected, clear state
				setThreadId(null);
				setMessages([]);
				return;
			}

			setIsLoadingThread(true);
			try {
				const chatsResponse = await api.get(`/chat/${selectedThreadId}`);
				setThreadId(selectedThreadId);

				// Convert chats to messages format
				const loadedMessages = [];
				for (const chat of chatsResponse.data) {
					// Add user message
					loadedMessages.push({
						id: `user-${chat.id}`,
						role: "user",
						content: chat.query,
						parts: [{ type: "text", text: chat.query }],
					});

					// Add assistant message with papers
					if (chat.results && chat.results.length > 0) {
						loadedMessages.push({
							id: `assistant-${chat.id}`,
							role: "assistant",
							content: `Found ${chat.results.length} relevant papers for: ${chat.query}`,
							parts: [
								{
									type: "papers",
									papers: chat.results,
								},
							],
						});
					}
				}
				setMessages(loadedMessages);
				setError(null);
			} catch (err) {
				console.error("Error loading thread chats:", err);
				setError("Failed to load chat history");
			} finally {
				setIsLoadingThread(false);
			}
		};

		loadSelectedThread();
	}, [selectedThreadId]);

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			const newHeight = Math.min(textareaRef.current.scrollHeight, 300);
			textareaRef.current.style.height = `${newHeight}px`;
		}
	}, [input]);

	const handleInputChange = (e) => {
		setInput(e.currentTarget.value);
	};

	const handleSavePaper = async (paper) => {
		if (!projectId) return;

		setSavingDois((prev) => new Set([...prev, paper.doi]));

		try {
			// Add reference to project
			await api.post(`/projects/${projectId}/references`, {
				doi: paper.doi,
				title: paper.title,
				author: paper.author,
				abstract: paper.abstract,
			});
		} catch (err) {
			console.error("Error saving paper:", err);
			setError("Failed to save paper to project");
		} finally {
			setSavingDois((prev) => {
				const newSet = new Set(prev);
				newSet.delete(paper.doi);
				return newSet;
			});
		}
	};

	const handleSubmit = (e) => {
		if (e?.preventDefault) e.preventDefault();

		if (!input.trim()) return;

		const userText = input;
		setInput("");

		// Create thread if it doesn't exist
		const submitMessage = async () => {
			let activeThreadId = threadId;

			// If no thread exists, create one first
			if (!activeThreadId) {
				try {
					const threadResponse = await api.post("/threads/", {
						project_id: projectId,
						title: `Chat Session ${new Date().toLocaleString()}`,
					});
					activeThreadId = threadResponse.data.thread_id;
					setThreadId(activeThreadId);
				} catch (err) {
					console.error("Error creating thread:", err);
					setError("Failed to create chat session");
					return;
				}
			}

			// Add user message
			const userMessage = {
				id: Date.now().toString(),
				role: "user",
				content: userText,
				parts: [{ type: "text", text: userText }],
			};

			setMessages((prev) => [...prev, userMessage]);
			setStatus("streaming");
			setError(null);

			// Call chat API
			try {
				const chatResponse = await api.post("/chat/", {
					thread_id: activeThreadId,
					query: userText,
				});

				const papers = chatResponse.data.results || [];

				const assistantMessage = {
					id: (Date.now() + 1).toString(),
					role: "assistant",
					content: `Found ${papers.length} relevant papers for: ${userText}`,
					parts: [
						{
							type: "papers",
							papers: papers,
						},
					],
				};

				setMessages((prev) => [...prev, assistantMessage]);
				setStatus("ready");
			} catch (err) {
				console.error("Chat error:", err);
				setError(err.response?.data?.detail || "Failed to create chat");
				setStatus("ready");

				// Add error message
				const errorMessage = {
					id: (Date.now() + 2).toString(),
					role: "assistant",
					content: "Error processing query",
					parts: [
						{
							type: "text",
							text: err.response?.data?.detail || "Failed to fetch papers",
						},
					],
				};
				setMessages((prev) => [...prev, errorMessage]);
			}
		};

		submitMessage();
	};

	if (!projectId) {
		return (
			<div className="mx-auto p-6 relative w-full h-full rounded-b-lg border flex items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground">No project selected</p>
					<p className="text-sm text-muted-foreground mt-2">
						Please select a project to begin chatting
					</p>
				</div>
			</div>
		);
	}

	if (error && error.includes("initialize")) {
		return (
			<div className="mx-auto p-6 relative w-full h-full rounded-b-lg border flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-500">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto p-6 relative w-full h-full rounded-b-lg border">
			<div className="flex flex-col h-full">
				{error && error.includes("initialize") === false && (
					<div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
						{error}
					</div>
				)}
				<Conversation>
					<ConversationContent>
						{isLoadingThread ? (
							<ConversationEmptyState
								icon={<Loader2 className="size-12 animate-spin" />}
								title="Loading chat history"
								description="Please wait..."
							/>
						) : messages.length === 0 ? (
							<ConversationEmptyState
								icon={<MessageSquare className="size-12" />}
								title="Start a conversation"
								description="Ask questions about research papers and find relevant literature"
							/>
						) : (
							messages.map((message) => (
								<Message from={message.role} key={message.id}>
									<MessageContent>
										{message.parts.map((part, i) => {
											switch (part.type) {
												case "text":
													return (
														<MessageResponse
															className={
																message.role === "user"
																	? "text-background"
																	: "text-foreground"
															}
															key={`${message.id}-${i}`}
														>
															{part.text}
														</MessageResponse>
													);
												case "papers":
													return (
														<div key={`${message.id}-${i}`} className="w-full">
															<PaperResults
																papers={part.papers}
																onSavePaper={handleSavePaper}
																savingDois={savingDois}
															/>
														</div>
													);
												default:
													return null;
											}
										})}
									</MessageContent>
								</Message>
							))
						)}
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>
				<PromptInput
					onSubmit={handleSubmit}
					className="mt-4 w-full max-w-2xl mx-auto relative"
				>
					<PromptInputTextarea
						ref={textareaRef}
						value={input}
						placeholder="Search papers, ask about research topics..."
						onChange={handleInputChange}
						disabled={status === "streaming"}
						style={{
							resize: "none",
							overflow: "hidden",
							maxHeight: "200px",
						}}
						className="pr-12"
					/>
					<PromptInputSubmit
						status={status}
						disabled={!input.trim()}
						className="absolute bottom-1 right-1"
					/>
				</PromptInput>
			</div>
		</div>
	);
};

export default ConversationDemo;
