// import {
// 	Attachment,
// 	AttachmentPreview,
// 	AttachmentRemove,
// 	Attachments,
// } from "@/components/ai-elements/attachments";
// import {
// 	ModelSelector,
// 	ModelSelectorContent,
// 	ModelSelectorEmpty,
// 	ModelSelectorGroup,
// 	ModelSelectorInput,
// 	ModelSelectorItem,
// 	ModelSelectorList,
// 	ModelSelectorLogo,
// 	ModelSelectorLogoGroup,
// 	ModelSelectorName,
// 	ModelSelectorTrigger,
// } from "@/components/ai-elements/model-selector";
// import {
// 	PromptInput,
// 	PromptInputActionAddAttachments,
// 	PromptInputActionMenu,
// 	PromptInputActionMenuContent,
// 	PromptInputActionMenuTrigger,
// 	PromptInputBody,
// 	PromptInputButton,
// 	PromptInputFooter,
// 	PromptInputProvider,
// 	PromptInputSubmit,
// 	PromptInputTextarea,
// 	PromptInputTools,
// 	usePromptInputAttachments,
// 	usePromptInputController,
// } from "@/components/ai-elements/prompt-input";
// import { Button } from "@/components/ui/button";
// import { ButtonGroup } from "@/components/ui/button-group";
// import { CheckIcon, GlobeIcon } from "lucide-react";
// import { useState } from "react";

// const models = [
// 	{
// 		id: "gpt-4o",
// 		name: "GPT-4o",
// 		chef: "OpenAI",
// 		chefSlug: "openai",
// 		providers: ["openai", "azure"],
// 	},
// 	{
// 		id: "gpt-4o-mini",
// 		name: "GPT-4o Mini",
// 		chef: "OpenAI",
// 		chefSlug: "openai",
// 		providers: ["openai", "azure"],
// 	},
// 	{
// 		id: "claude-opus-4-20250514",
// 		name: "Claude 4 Opus",
// 		chef: "Anthropic",
// 		chefSlug: "anthropic",
// 		providers: ["anthropic", "azure", "google", "amazon-bedrock"],
// 	},
// 	{
// 		id: "claude-sonnet-4-20250514",
// 		name: "Claude 4 Sonnet",
// 		chef: "Anthropic",
// 		chefSlug: "anthropic",
// 		providers: ["anthropic", "azure", "google", "amazon-bedrock"],
// 	},
// 	{
// 		id: "gemini-2.0-flash-exp",
// 		name: "Gemini 2.0 Flash",
// 		chef: "Google",
// 		chefSlug: "google",
// 		providers: ["google"],
// 	},
// ];

// const SUBMITTING_TIMEOUT = 200;
// const STREAMING_TIMEOUT = 2000;

// const PromptInputAttachmentsDisplay = () => {
// 	const attachments = usePromptInputAttachments();

// 	if (attachments.files.length === 0) {
// 		return null;
// 	}

// 	return (
// 		<Attachments variant="inline">
// 			{attachments.files.map((attachment) => (
// 				<Attachment
// 					data={attachment}
// 					key={attachment.id}
// 					onRemove={() => attachments.remove(attachment.id)}
// 				>
// 					<AttachmentPreview />
// 					<AttachmentRemove />
// 				</Attachment>
// 			))}
// 		</Attachments>
// 	);
// };

// const HeaderControls = () => {
// 	const controller = usePromptInputController();

// 	return (
// 		<header className="mt-8 flex items-center justify-between">
// 			<p className="text-sm">
// 				Header Controls via{" "}
// 				<code className="rounded-md bg-muted p-1 font-bold">
// 					PromptInputProvider
// 				</code>
// 			</p>
// 			<ButtonGroup>
// 				<Button
// 					onClick={() => {
// 						controller.textInput.clear();
// 					}}
// 					size="sm"
// 					type="button"
// 					variant="outline"
// 				>
// 					Clear input
// 				</Button>
// 				<Button
// 					onClick={() => {
// 						controller.textInput.setInput("Inserted via PromptInputProvider");
// 					}}
// 					size="sm"
// 					type="button"
// 					variant="outline"
// 				>
// 					Set input
// 				</Button>

// 				<Button
// 					onClick={() => {
// 						controller.attachments.clear();
// 					}}
// 					size="sm"
// 					type="button"
// 					variant="outline"
// 				>
// 					Clear attachments
// 				</Button>
// 			</ButtonGroup>
// 		</header>
// 	);
// };

// const ChatInput = () => {
// 	const [model, setModel] = useState(models[0].id);
// 	const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
// 	// const [status, setStatus] =		(useState < "submitted") | "streaming" | "ready" | ("error" > "ready");
// 	// const [status, setStatus] = useState("ready");
// 	const STATUS = {
// 		SUBMITTED: "submitted",
// 		STREAMING: "streaming",
// 		READY: "ready",
// 		ERROR: "error",
// 	};

// 	const [status, setStatus] = useState(STATUS.READY);

// 	const selectedModelData = models.find((m) => m.id === model);

// 	const handleSubmit = (message) => {
// 		const hasText = Boolean(message.text);
// 		const hasAttachments = Boolean(message.files?.length);

// 		if (!(hasText || hasAttachments)) {
// 			return;
// 		}

// 		setStatus("submitted");

// 		// eslint-disable-next-line no-console
// 		console.log("Submitting message:", message);

// 		setTimeout(() => {
// 			setStatus("streaming");
// 		}, SUBMITTING_TIMEOUT);

// 		setTimeout(() => {
// 			setStatus("ready");
// 		}, STREAMING_TIMEOUT);
// 	};

// 	return (
// 		<div className="size-full p-4 flex justify-center items-center">
// 			<PromptInputProvider>
// 				<PromptInput globalDrop multiple onSubmit={handleSubmit}>
// 					<PromptInputAttachmentsDisplay />
// 					<PromptInputBody>
// 						<PromptInputTextarea />
// 					</PromptInputBody>
// 					<PromptInputFooter>
// 						<PromptInputTools>
// 							<PromptInputActionMenu>
// 								<PromptInputActionMenuTrigger />
// 								<PromptInputActionMenuContent>
// 									<PromptInputActionAddAttachments />
// 								</PromptInputActionMenuContent>
// 							</PromptInputActionMenu>
// 							<PromptInputButton>
// 								<GlobeIcon size={16} />
// 								<span>Search</span>
// 							</PromptInputButton>
// 							<ModelSelector
// 								onOpenChange={setModelSelectorOpen}
// 								open={modelSelectorOpen}
// 							>
// 								<ModelSelectorTrigger asChild>
// 									<PromptInputButton>
// 										{selectedModelData?.chefSlug && (
// 											<ModelSelectorLogo
// 												provider={selectedModelData.chefSlug}
// 											/>
// 										)}
// 										{selectedModelData?.name && (
// 											<ModelSelectorName>
// 												{selectedModelData.name}
// 											</ModelSelectorName>
// 										)}
// 									</PromptInputButton>
// 								</ModelSelectorTrigger>
// 								<ModelSelectorContent>
// 									<ModelSelectorInput placeholder="Search models..." />
// 									<ModelSelectorList>
// 										<ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
// 										{["OpenAI", "Anthropic", "Google"].map((chef) => (
// 											<ModelSelectorGroup heading={chef} key={chef}>
// 												{models
// 													.filter((m) => m.chef === chef)
// 													.map((m) => (
// 														<ModelSelectorItem
// 															key={m.id}
// 															onSelect={() => {
// 																setModel(m.id);
// 																setModelSelectorOpen(false);
// 															}}
// 															value={m.id}
// 														>
// 															<ModelSelectorLogo provider={m.chefSlug} />
// 															<ModelSelectorName>{m.name}</ModelSelectorName>
// 															<ModelSelectorLogoGroup>
// 																{m.providers.map((provider) => (
// 																	<ModelSelectorLogo
// 																		key={provider}
// 																		provider={provider}
// 																	/>
// 																))}
// 															</ModelSelectorLogoGroup>
// 															{model === m.id ? (
// 																<CheckIcon className="ml-auto size-4" />
// 															) : (
// 																<div className="ml-auto size-4" />
// 															)}
// 														</ModelSelectorItem>
// 													))}
// 											</ModelSelectorGroup>
// 										))}
// 									</ModelSelectorList>
// 								</ModelSelectorContent>
// 							</ModelSelector>
// 						</PromptInputTools>
// 						<PromptInputSubmit status={status} />
// 					</PromptInputFooter>
// 				</PromptInput>

// 				{/* <HeaderControls /> */}
// 			</PromptInputProvider>
// 		</div>
// 	);
// };

// export default ChatInput;

"use client";
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
import { useChat } from "@ai-sdk/react";
const ConversationDemo = () => {
	const [input, setInput] = useState("");
	const { messages, sendMessage, status } = useChat();
	const handleSubmit = (e) => {
		e.preventDefault();
		if (input.trim()) {
			sendMessage({ text: input });
			setInput("");
		}
	};
	return (
		<div className="mx-auto p-6 relative w-full h-auto rounded-lg border h-[600px]">
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
												case "text": // we don't use any reasoning or tool calls in this example
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
				{/* <Input
					onSubmit={handleSubmit}
					className="mt-4 w-full max-w-2xl mx-auto relative"
				> */}
				<PromptInput
					onSubmit={({ text }) => {
						if (text.trim()) {
							sendMessage({ text });
						}
					}}
					className="mt-4 w-full max-w-2xl mx-auto relative"
				>
					<PromptInputTextarea
						value={input}
						placeholder="Say something..."
						onChange={(e) => setInput(e.currentTarget.value)}
						className="pr-12"
					/>
					<PromptInputSubmit
						status={status === "streaming" ? "streaming" : "ready"}
						disabled={!input.trim()}
						className="absolute bottom-1 right-1"
					/>
				</PromptInput>
			</div>
		</div>
	);
};
export default ConversationDemo;
