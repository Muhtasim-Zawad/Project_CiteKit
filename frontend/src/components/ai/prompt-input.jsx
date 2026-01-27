// import {
// 	Conversation,
// 	ConversationContent,
// 	ConversationEmptyState,
// 	ConversationScrollButton,
// } from "@/components/ai-elements/conversation";
// import {
// 	Message,
// 	MessageContent,
// 	MessageResponse,
// } from "@/components/ai-elements/message";
// import {
// 	PromptInput,
// 	PromptInputTextarea,
// 	PromptInputSubmit,
// } from "@/components/ai-elements/prompt-input";
// import { MessageSquare } from "lucide-react";
// import { useState } from "react";
// import { useChat } from "@ai-sdk/react";
// const ConversationDemo = () => {
// 	const [input, setInput] = useState("");
// 	const { messages, append, sendMessage, status } = useChat();

// 	// have to remove
// 	// 1. Destructure 'append' from the hook

// 	const handleSubmit = (e) => {
// 		// Check if e exists (some custom components don't pass it)
// 		if (e?.preventDefault) e.preventDefault();

// 		if (!input.trim()) return;

// 		const userText = input;
// 		setInput("");

// 		// 2. This now points to the same state the UI is using!
// 		append({
// 			id: Date.now().toString(),
// 			role: "user",
// 			content: userText,
// 			parts: [{ type: "text", text: userText }],
// 		});

// 		setTimeout(() => {
// 			append({
// 				id: (Date.now() + 1).toString(),
// 				role: "assistant",
// 				content: `Mock reply to: ${userText}`,
// 				parts: [
// 					{
// 						type: "text",
// 						text: `You said: "${userText}". This is a mock response!`,
// 					},
// 				],
// 			});
// 		}, 600);
// 	};

// 	// const handleSubmit = (e) => {
// 	// 	e.preventDefault();
// 	// 	// if (input.trim()) {
// 	// 	// 	sendMessage({ text: input });
// 	// 	// 	setInput("");
// 	// 	// }

// 	// 	if (!input.trim()) return;

// 	// 	// 1. Add the user message to the UI
// 	// 	const userMessage = { role: "user", content: input };

// 	// 	// 2. Clear input
// 	// 	setInput("");

// 	// 	// 3. Manually append user message and trigger a mock response
// 	// 	// We use append() to simulate the SDK's internal state management
// 	// 	append(userMessage);

// 	// 	// 4. Simulate a delay then "reply"
// 	// 	setTimeout(() => {
// 	// 		append({
// 	// 			role: "assistant",
// 	// 			content: `You said: "${input}". This is a mock response!`,
// 	// 			// Ensure 'parts' is included since your UI maps over message.parts
// 	// 			parts: [
// 	// 				{
// 	// 					type: "text",
// 	// 					text: `You said: "${input}". This is a mock response!`,
// 	// 				},
// 	// 			],
// 	// 		});
// 	// 	}, 0);
// 	// };
// 	return (
// 		<div className="mx-auto p-6 relative w-full h-auto rounded-b-lg border">
// 			<div className="flex flex-col h-full">
// 				<Conversation>
// 					<ConversationContent>
// 						{messages.length === 0 ? (
// 							<ConversationEmptyState
// 								icon={<MessageSquare className="size-12" />}
// 								title="Start a conversation"
// 								description="Type a message below to begin chatting"
// 							/>
// 						) : (
// 							messages.map((message) => (
// 								<Message from={message.role} key={message.id}>
// 									<MessageContent>
// 										{message.parts.map((part, i) => {
// 											switch (part.type) {
// 												case "text": // we don't use any reasoning or tool calls in this example
// 													return (
// 														<MessageResponse key={`${message.id}-${i}`}>
// 															{part.text}
// 														</MessageResponse>
// 													);
// 												default:
// 													return null;
// 											}
// 										})}
// 									</MessageContent>
// 								</Message>
// 							))
// 						)}
// 					</ConversationContent>
// 					<ConversationScrollButton />
// 				</Conversation>
// 				{/* <Input
// 					onSubmit={handleSubmit}
// 					className="mt-4 w-full max-w-2xl mx-auto relative"
// 				> */}
// 				<PromptInput
// 					// onSubmit={({ text }) => {
// 					// 	if (text.trim()) {
// 					// 		sendMessage({ text });
// 					// 	}
// 					// }}
// 					onSubmit={() => handleSubmit()}
// 					className="mt-4 w-full max-w-2xl mx-auto relative"
// 				>
// 					<PromptInputTextarea
// 						value={input}
// 						placeholder="Say something..."
// 						onChange={(e) => setInput(e.currentTarget.value)}
// 						className="pr-12"
// 					/>
// 					<PromptInputSubmit
// 						status={status === "streaming" ? "streaming" : "ready"}
// 						disabled={!input.trim()}
// 						className="absolute bottom-1 right-1"
// 					/>
// 				</PromptInput>
// 			</div>
// 		</div>
// 	);
// };
// export default ConversationDemo;

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
import { MessageSquare } from "lucide-react";
import { useState } from "react";

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

		// Simulate assistant response
		setTimeout(() => {
			const assistantMessage = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: `Mock reply to: ${userText}`,
				parts: [
					{
						type: "text",
						text: `You said: "${userText}". This is a mock response!`,
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
														<MessageResponse key={`${message.id}-${i}`}>
															{part.text}
														</MessageResponse>
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
						placeholder="Say something..."
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
