import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";

export function SectionCards() {
	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			<Card className="@container/card">
				<CardHeader>
					<CardTitle className="text-1xl font-semibold tabular-nums @[250px]/card:text-3xl">
						paper_01_title
					</CardTitle>
				</CardHeader>
				<CardContent className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea,
						perferendis.
					</div>
				</CardContent>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Paper_02</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						paper_02_title
					</CardTitle>
					{/* <CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea,
						perferendis.
					</div>
					{/* <div className="text-muted-foreground">
						Visitors for the last 6 months
					</div> */}
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Paper_03</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						paper_03_title
					</CardTitle>
					{/* <CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea,
						perferendis.
					</div>
					{/* <div className="text-muted-foreground">
						Visitors for the last 6 months
					</div> */}
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Paper_04</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						paper_04_title
					</CardTitle>
					{/* <CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea,
						perferendis.
					</div>
					{/* <div className="text-muted-foreground">
						Visitors for the last 6 months
					</div> */}
				</CardFooter>
			</Card>

			{/* ----------------------------------------------- */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Paper_01</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						paper_01_title
					</CardTitle>
					{/* <CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea,
						perferendis.
					</div>
					{/* <div className="text-muted-foreground">
						Visitors for the last 6 months
					</div> */}
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Paper_02</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						paper_02_title
					</CardTitle>
					{/* <CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea,
						perferendis.
					</div>
					{/* <div className="text-muted-foreground">
						Visitors for the last 6 months
					</div> */}
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Paper_03</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						paper_03_title
					</CardTitle>
					{/* <CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea,
						perferendis.
					</div>
					{/* <div className="text-muted-foreground">
						Visitors for the last 6 months
					</div> */}
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Paper_04</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						paper_04_title
					</CardTitle>
					{/* <CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea,
						perferendis.
					</div>
					{/* <div className="text-muted-foreground">
						Visitors for the last 6 months
					</div> */}
				</CardFooter>
			</Card>
		</div>
	);
}
