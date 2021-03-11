import { Avatar, Grid, Box, Typography, Link } from "@material-ui/core";
import { ThumbUp } from "@material-ui/icons";
import Highlighter from "react-highlight-words";

export interface Comment {
	id: string;
	videoId: string;
	author: {
		name: string;
		thumbnail: string;
	};
	likeCount: number;
	publishDate: string;
	content: string;
	_score: number;
}

function CommentRenderer({
	comment,
	highlightedWords,
}: {
	comment: Comment;
	highlightedWords: string;
}) {
	return (
		<Grid container wrap="nowrap">
			<Grid item>
				<Avatar
					alt={comment.author.name}
					src={comment.author.thumbnail}
				/>
			</Grid>
			<Grid item>
				<Typography component={"span"} variant="body2">
					<Grid container>
						<Link
							href={`https://www.youtube.com/watch?v=${comment.videoId}&lc=${comment.id}`}
							target="_blank"
						>
							<Box pl={2} pb="2px" fontWeight="fontWeightBold">
								{comment.author.name}
							</Box>
						</Link>
					</Grid>
				</Typography>

				<Box pl={2}>
					<Typography
						style={{ wordWrap: "break-word" }}
						variant="body2"
					>
						<Highlighter
							searchWords={highlightedWords.split(" ")}
							autoEscape={true}
							textToHighlight={comment.content}
						/>
					</Typography>
				</Box>

				<Box
					pl={2}
					pt={1}
					fontSize={16}
					color="text.secondary"
					className="align-center"
				>
					<ThumbUp fontSize="inherit" />{" "}
					<Box pl={1}>
						<Typography variant="body2">
							{comment.likeCount}
						</Typography>
					</Box>
				</Box>
			</Grid>
		</Grid>
	);
}

export default CommentRenderer;
