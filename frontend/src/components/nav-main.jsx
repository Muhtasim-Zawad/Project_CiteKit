import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { NewProject } from "@/components/new-project";

import { Button } from "@/components/ui/button";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({ items, onItemClick }) {
	const navigate = useNavigate();
	const openProject = () => {
		// navigate(`/workspace/${projectId}`);
		navigate("/workspace");
	};

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					<SidebarMenuItem className="flex items-center gap-2">
						<NewProject
							trigger={
								<SidebarMenuButton
									tooltip="Quick Create"
									className="hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground transition-colors min-w-8 duration-100 ease-linear"
								>
									<IconCirclePlusFilled />
									<span>New Project</span>
								</SidebarMenuButton>
							}
							onSave={() => navigate("/workspace")}
						/>
						{/* <Button
							size="icon"
							className="size-8 group-data-[collapsible=icon]:opacity-0"
							variant="outline"
						>
							<IconMail />
							<span className="sr-only">Inbox</span>
						</Button> */}
					</SidebarMenuItem>
				</SidebarMenu>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								tooltip={item.title}
								onClick={() => {
									onItemClick?.(item.viewType);
								}}
							>
								{item.icon && <item.icon />}
								<span>{item.title}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
