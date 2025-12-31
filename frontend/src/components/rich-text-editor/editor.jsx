// src/Tiptap.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./menu-bar";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

export default function Editor() {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bulletList: {
					HTMLAttributes: {
						class: "list-disc ml-3",
					},
				},
				orderedList: {
					HTMLAttributes: {
						class: "list-decimal ml-3",
					},
				},
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Highlight,
		], // define your extension array
		content: "<p>Hello World!</p>",
		// editorProps: {
		// 	attributes: {
		// 		class: "min-h-[156px] min-h-0 border rounded-md bg-slate-50 py-2 px-3",
		// 	},
		// },
	});

	// return (
	// 	<>
	// 		<MenuBar editor={editor} />
	// 		<EditorContent editor={editor} />
	// 		{/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
	// 		<BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
	// 	</>
	// );

	return (
		<div className="relative flex h-full min-h-0 w-full flex-col border rounded-md bg-card">
			{/* Toolbar */}
			<MenuBar editor={editor} />

			{/* Editor */}
			<EditorContent
				editor={editor}
				className="
          flex-1 min-h-0 w-full
          cursor-text
          p-4
          prose prose-sm max-w-none
          overflow-y-auto
          [&_.ProseMirror]:min-h-full
          [&_.ProseMirror]:outline-none
        "
			/>
		</div>
	);
}

{
	/* Optional floating UI */
}
{
	/* <FloatingToolbar editor={editor} /> */
}
{
	/* <TipTapFloatingMenu editor={editor} /> */
}
