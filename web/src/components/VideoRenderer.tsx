import {
	// Components
	Avatar,
	Grid,
	Box,
	Button,
	Typography,
	CircularProgress,
	Card,
	CardContent,
	CardMedia,
	CardActions,
	Link,
	// Styles related
	makeStyles,
	createStyles,
} from "@material-ui/core";
import { indexVideoComments } from "../api";
import { useState } from "react";

export interface Video {
	id: string;
	title: string;
	thumbnail: string;
	likeCount: number;
	dislikeCount: number;
	totalIndexedComments: number;
	channel: {
		id: string;
		name: string;
		thumbnail: string;
	};
}

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			display: "flex",
		},
		details: {
			display: "flex",
			flexDirection: "column",
		},
		content: {
			flex: "1 0 auto",
		},
		cover: {
			width: 360,
			height: 200,
		},
		avatar: {
			width: theme.spacing(4),
			height: theme.spacing(4),
		},
	})
);

interface VideoRendererProperties {
	video: Video;
	onIndexFinish?: Function;
}

function VideoRenderer({ video, onIndexFinish }: VideoRendererProperties) {
	const [isIndexing, setIsIndexing] = useState(false);
	const classes = useStyles();

	async function indexComments() {
		setIsIndexing(true);
		await indexVideoComments(video.id);
		onIndexFinish?.();
		setIsIndexing(false);
	}

	return (
		<Card className={classes.root}>
			<CardMedia className={classes.cover} image={video.thumbnail} />
			<div className={classes.details}>
				<CardContent className={classes.content}>
					<Typography component="h6" variant="h6">
						<Link
							href={`https://youtube.com/watch?v=${video.id}`}
							target="_blank"
						>
							{video.title}
						</Link>
					</Typography>
					<Grid container wrap="nowrap">
						<Grid item>
							<Avatar
								alt={video.channel.name}
								src={video.channel.thumbnail}
								className={classes.avatar}
							/>
						</Grid>
						<Box pl={1} className="align-center">
							<Grid item>
								<Typography variant="body2" component="div">
									<Link
										href={`https://www.youtube.com/channel/${video.channel.id}`}
										target="_blank"
									>
										<Box
											fontWeight={600}
											color="text.secondary"
										>
											{video.channel.name}
										</Box>
									</Link>
								</Typography>
							</Grid>
						</Box>
					</Grid>
					<Box pt={1}>
						<Typography variant="body2">
							{video.totalIndexedComments} indexed comments
						</Typography>
					</Box>
				</CardContent>

				<CardActions>
					<Box pl={1}>
						<Button
							variant="contained"
							color="primary"
							disableElevation
							disabled={isIndexing}
							onClick={indexComments}
						>
							{isIndexing && (
								<Box
									color="primary"
									mr={2}
									className="align-center"
								>
									<CircularProgress
										color="inherit"
										size={18}
									/>
								</Box>
							)}
							Index Comments
						</Button>
					</Box>
				</CardActions>
			</div>
		</Card>
	);
}

export default VideoRenderer;
