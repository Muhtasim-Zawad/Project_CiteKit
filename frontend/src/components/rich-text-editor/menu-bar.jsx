import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	Heading1,
	Heading2,
	Heading3,
	Highlighter,
	Italic,
	List,
	ListOrdered,
	Strikethrough,
} from "lucide-react";
import { Toggle } from "../ui/toggle";
import { Editor } from "@tiptap/react";
import { Separator } from "../ui/separator";

export default function MenuBar({ editor }) {
	if (!editor) {
		return null;
	}

	const Options = [
		{
			icon: <Heading1 className="size-4" />,
			onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
			preesed: editor.isActive("heading", { level: 1 }),
			break: false,
		},
		{
			icon: <Heading2 className="size-4" />,
			onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
			preesed: editor.isActive("heading", { level: 2 }),
			break: false,
		},
		{
			icon: <Heading3 className="size-4" />,
			onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
			preesed: editor.isActive("heading", { level: 3 }),
			break: true,
		},
		{
			icon: <Bold className="size-4" />,
			onClick: () => editor.chain().focus().toggleBold().run(),
			preesed: editor.isActive("bold"),
			break: false,
		},
		{
			icon: <Italic className="size-4" />,
			onClick: () => editor.chain().focus().toggleItalic().run(),
			preesed: editor.isActive("italic"),
			break: false,
		},
		{
			icon: <Strikethrough className="size-4" />,
			onClick: () => editor.chain().focus().toggleStrike().run(),
			preesed: editor.isActive("strike"),
			break: true,
		},
		{
			icon: <AlignLeft className="size-4" />,
			onClick: () => editor.chain().focus().setTextAlign("left").run(),
			preesed: editor.isActive({ textAlign: "left" }),
			break: false,
		},
		{
			icon: <AlignCenter className="size-4" />,
			onClick: () => editor.chain().focus().setTextAlign("center").run(),
			preesed: editor.isActive({ textAlign: "center" }),
			break: false,
		},
		{
			icon: <AlignRight className="size-4" />,
			onClick: () => editor.chain().focus().setTextAlign("right").run(),
			preesed: editor.isActive({ textAlign: "right" }),
			break: true,
		},
		{
			icon: <List className="size-4" />,
			onClick: () => editor.chain().focus().toggleBulletList().run(),
			preesed: editor.isActive("bulletList"),
			break: false,
		},
		{
			icon: <ListOrdered className="size-4" />,
			onClick: () => editor.chain().focus().toggleOrderedList().run(),
			preesed: editor.isActive("orderedList"),
			break: false,
		},
		{
			icon: <Highlighter className="size-4" />,
			onClick: () => editor.chain().focus().toggleHighlight().run(),
			preesed: editor.isActive("highlight"),
			break: false,
		},
	];

	return (
		<div className="border sticky top-0 rounded-t-md p-1 mb-1 bg-background flex items-center space-x-2 flex-wrap z-50">
			{Options.map((option, index) => (
				<div key={index} className="flex items-center">
					<Toggle pressed={option.preesed} onPressedChange={option.onClick}>
						{option.icon}
					</Toggle>

					{option.break && (
						<Separator
							orientation="vertical"
							className="mx-2 data-[orientation=vertical]:h-4"
						/>
					)}
				</div>
			))}
		</div>
	);
}
