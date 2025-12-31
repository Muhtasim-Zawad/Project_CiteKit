// src/Tiptap.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./menu-bar";

export default function Editor() {
	const editor = useEditor({
		extensions: [StarterKit], // define your extension array
		content: "<p>Hello World!</p>",
		editorProps: {
			attributes: {
				class: "min-h-[156px] border rounded-md bg-slate-50 py-2 px-3",
			},
		},
	});

	return (
		<>
			<MenuBar editor={editor} />
			<EditorContent editor={editor} />
			<FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
			<BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
		</>
	);
}
