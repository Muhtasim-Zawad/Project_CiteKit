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
import { MessageSquare, BookOpen, Quote } from "lucide-react";
import { useState } from "react";
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

// Mock paper data
const MOCK_PAPERS = [
	{
		id: 1,
		title: "Attention Is All You Need",
		authors: ["Ashish Vaswani", "Noam Shazeer", "Parmar Aditya"],
		year: 2017,
		abstract:
			"The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. In an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
		citations: 89542,
	},
	{
		id: 2,
		title: "BERT: Pre-training of Deep Bidirectional Transformers",
		authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee"],
		year: 2018,
		abstract:
			"We introduce BERT, a new method of pre-training language representations from raw text. Unlike previous methods, BERT is designed to pre-train deep bidirectional representations by jointly conditioning on both left and right context in all layers.",
		citations: 76123,
	},
	{
		id: 3,
		title: "Language Models are Unsupervised Multitask Learners",
		authors: ["Alec Radford", "Jeffrey Wu", "Rewon Child"],
		year: 2019,
		abstract:
			"Natural language processing tasks are typically approached with supervised learning on task-specific datasets. We demonstrate that language models begin to learn these tasks without any explicit supervision when trained on a new dataset of millions of webpages.",
		citations: 45678,
	},
	{
		id: 4,
		title:
			"Neural Machine Translation by Jointly Learning to Align and Translate",
		authors: ["Dzmitry Bahdanau", "Kyungyoon Cho", "Yoshua Bengio"],
		year: 2014,
		abstract:
			"Most neural machine translation systems work on a fixed-length context vector, or 'thought vector', onto which the entire input sentence must be compressed. We conjecture that the use of a fixed-length vector is a bottleneck in improving the performance.",
		citations: 34521,
	},
	{
		id: 5,
		title: "ImageNet-21K Pretraining for the Masses",
		authors: ["Tal Ridnik", "Emanuel Ben Baruch", "Asaf Noy"],
		year: 2021,
		abstract:
			"ImageNet-21K pretraining has been used to achieve state-of-the-art results on many visual recognition tasks. However, its adoption remains limited to practitioners with access to large computational resources. We investigate how to enable efficient pretraining on ImageNet-21K.",
		citations: 12345,
	},
];

// Paper Card Component
const PaperCard = ({ paper, onSelect }) => {
	const truncatedAbstract =
		paper.abstract.length > 120
			? paper.abstract.substring(0, 120) + "..."
			: paper.abstract;

	return (
		<div
			onClick={() => onSelect(paper)}
			className="group relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-background backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:from-primary/10 border border-primary/20 rounded-lg p-4 cursor-pointer"
		>
			<div className="space-y-3">
				<div>
					<h3 className="font-bold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
						{paper.title}
					</h3>
					<Badge className="mt-2 bg-primary/10 text-primary border-primary/20">
						{paper.year}
					</Badge>
				</div>

				<p className="text-xs text-muted-foreground line-clamp-3">
					{truncatedAbstract}
				</p>

				<div className="flex gap-2 pt-2">
					<Button
						size="xs"
						variant="ghost"
						className="h-7 text-xs hover:bg-primary/10 hover:text-primary"
					>
						<BookOpen className="h-3 w-3 mr-1" /> View
					</Button>
					<Button
						size="xs"
						variant="ghost"
						className="h-7 text-xs hover:bg-secondary/10 hover:text-secondary"
					>
						<Quote className="h-3 w-3 mr-1" /> {paper.citations}
					</Button>
					<Button className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2">
						Add
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
				className="max-w-2xl max-h-[90vh] overflow-y-auto via-card bg-background"
			>
				<div className="space-y-6 py-4">
					<DialogHeader className="space-y-4">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1">
								<DialogTitle className="text-2xl font-bold text-foreground">
									{paper.title}
								</DialogTitle>
								<Badge className="mt-3 bg-primary/10 text-primary border-primary/20 text-sm">
									{paper.year}
								</Badge>
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

					{/* Authors Section */}
					<div>
						<h3 className="text-sm font-semibold text-foreground mb-2">
							Authors
						</h3>
						<div className="flex flex-wrap gap-2">
							{paper.authors.map((author) => (
								<Badge
									key={author}
									variant="outline"
									className="text-sm bg-primary/5 text-primary border-primary/20"
								>
									{author}
								</Badge>
							))}
						</div>
					</div>

					{/* Abstract Section */}
					<div>
						<h3 className="text-sm font-semibold text-foreground mb-2">
							Abstract
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed bg-primary/5 rounded-lg p-4 border border-primary/10">
							{paper.abstract}
						</p>
					</div>

					{/* Stats Section */}
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
							<p className="text-xs text-muted-foreground font-medium">
								Citations
							</p>
							<p className="text-xl font-bold text-primary mt-1">
								{paper.citations.toLocaleString()}
							</p>
						</div>
						<div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
							<p className="text-xs text-muted-foreground font-medium">
								Published
							</p>
							<p className="text-xl font-bold text-primary mt-1">
								{paper.year}
							</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4 border-t border-primary/10">
						<Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
							<BookOpen className="h-4 w-4 mr-2" /> View Paper
						</Button>
						<Button variant="outline" className="flex-1">
							<Quote className="h-4 w-4 mr-2" /> Citations
						</Button>
						<Button variant="secondary" className="flex-1">
							+ Add
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

// Paper Results Component
const PaperResults = ({ papers }) => {
	const [selectedPaper, setSelectedPaper] = useState(null);

	return (
		<>
			<div className="grid grid-cols-1 gap-3 py-2 max-w-2xl">
				{papers.map((paper) => (
					<PaperCard key={paper.id} paper={paper} onSelect={setSelectedPaper} />
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
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState([]);
	const [status, setStatus] = useState("ready");

	const handleSubmit = (e) => {
		if (e?.preventDefault) e.preventDefault();

		if (!input.trim()) return;

		const userText = input;
		setInput("");

		// Add user message
		const userMessage = {
			id: Date.now().toString(),
			role: "user",
			content: userText,
			parts: [{ type: "text", text: userText }],
		};

		setMessages((prev) => [...prev, userMessage]);
		setStatus("streaming");

		// Simulate assistant response with paper results
		setTimeout(() => {
			const assistantMessage = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: `Found 5 relevant papers for: ${userText}`,
				parts: [
					{
						type: "papers",
						papers: MOCK_PAPERS,
					},
				],
			};

			setMessages((prev) => [...prev, assistantMessage]);
			setStatus("ready");
		}, 600);
	};

	return (
		<div className="mx-auto p-6 relative w-full h-auto rounded-b-lg border">
			<div className="flex flex-col h-full">
				<Conversation>
					<ConversationContent>
						{messages.length === 0 ? (
							<ConversationEmptyState
								icon={<MessageSquare className="size-12" />}
								title="Start a conversation"
								description="Type a message below to begin chatting"
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
															<PaperResults papers={part.papers} />
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
						value={input}
						placeholder="Search papers, ask about research topics..."
						onChange={(e) => setInput(e.currentTarget.value)}
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
