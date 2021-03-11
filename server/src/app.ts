import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") dotenv.config();

import express from "express";
import cors from "cors";
import { Client, LiveVideo, Video } from "youtubei";
import es, {
	indexVideoComments,
	createIndices,
	searchComments,
	getIndexedCommentCount,
} from "./service";

const youtube = new Client();
const port = process.env.PORT || 3030;
const app = express();
app.use(cors());

/** Start indexing video's comments */
app.post("/videos/:videoId/index", async (req, res) => {
	const videoId = req.params.videoId;
	if (!videoId) return res.sendStatus(400);

	const video = await youtube.getVideo(videoId);
	if (!video || video instanceof LiveVideo) return res.sendStatus(404);

	await indexVideoComments(video);
	res.sendStatus(200);
});

/** Delete all comments by video id */
app.delete("/videos/:videoId/comments", async (req, res) => {
	const videoId = req.params.videoId;
	if (!videoId) return res.sendStatus(400);
	await es.deleteByQuery({
		index: "comments",
		body: { query: { match: { videoId } } },
	});
	res.send(204);
});

/** Get video information */
app.get("/videos/:videoId", async (req, res) => {
	const videoId = req.params.videoId;
	if (!videoId) return res.sendStatus(400);

	const video = (await youtube.getVideo(videoId)) as Video;
	if (!video) return res.sendStatus(404);
	const totalIndexedComments = await getIndexedCommentCount(video.id);
	res.send({
		id: video.id,
		title: video.title,
		thumbnail: video.thumbnails.best,
		likeCount: video.likeCount,
		dislikeCount: video.dislikeCount,
		totalIndexedComments,
		channel: {
			id: video.channel.id,
			name: video.channel.name,
			thumbnail: video.channel.thumbnails.min,
		},
	});
});

/** Search for comment in a video */
app.get("/videos/:videoId/comments", async (req, res) => {
	const videoId = req.params.videoId;
	const q = (req.query.q as string) || "";
	const page = +(req.query.page as string) || 1;
	const perPage = +(req.query.perPage as string) || 20;
	if (!videoId) return res.sendStatus(400);

	res.send(await searchComments(videoId, q, page, perPage));
});

/** Start the server */
async function startServer() {
	await createIndices();
	app.listen(port, () => {
		console.log(`Listening at http://localhost:${port}`);
	});
}

startServer();
