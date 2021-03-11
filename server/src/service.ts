import { Client } from "@elastic/elasticsearch";
import esb from "elastic-builder";
import { Comment, Video } from "youtubei";

interface ParsedComment {
	id: string;
	videoId: string;
	author: {
		name: string;
		thumbnail: string;
	};
	likeCount: number;
	content: string;
}

const es = new Client({
	node: `https://${process.env.ES_HOSTNAME || "localhost"}:9200`,
	auth: {
		username: process.env.ELASTICSEARCH_USERNAME || "admin",
		password: process.env.ELASTICSEARCH_PASSWORD || "admin",
	},
	ssl: { rejectUnauthorized: false },
});

const saveIndex = async (comments: Comment[]): Promise<void> => {
	console.log(`Indexing ${comments.length} comments (Video ID: ${comments[0].video.id})`);

	const parsedComments = comments.map((c) => {
		return {
			id: c.id,
			videoId: c.video.id,
			author: {
				name: c.author.name,
				thumbnail: c.author.thumbnails.best,
			},
			likeCount: c.likeCount,
			content: c.content,
		};
	});

	const body = parsedComments.flatMap((c) => [
		{ update: { _id: c.id, _index: "comments" } },
		{ doc_as_upsert: true, doc: c },
	]);
	await es.bulk({ refresh: true, index: "comments", body });
};

export const createIndices = async (): Promise<void> => {
	await es.indices.create(
		{
			index: "comments",
			body: {
				mappings: {
					properties: {
						_id: { type: "text" },
						author: { type: "text" },
						content: { type: "text" },
					},
				},
				filter: {
					autocomplete_filter: {
						type: "edge_ngram",
						min_gram: 2,
						max_gram: 20,
					},
				},
			},
		},
		{ ignore: [400] }
	);
};

export const getIndexedCommentCount = async (videoId: string): Promise<number> => {
	const { body } = await es.count({
		body: esb.requestBodySearch().query(esb.termQuery("videoId.keyword", videoId)),
	});
	return body.count;
};

export const searchComments = async (
	videoId: string,
	q: string,
	page = 1,
	perPage = 20
): Promise<{ total: number; comments: ParsedComment[] }> => {
	const keywords = q.split(" ");

	const { body } = await es.search({
		index: "comments",
		from: (page - 1) * perPage,
		size: perPage,
		body: esb
			.requestBodySearch()
			.query(
				esb
					.boolQuery()
					.must([
						esb.termQuery("videoId.keyword", videoId),
						esb.boolQuery().should(keywords.map((k) => esb.matchQuery("content", k))),
					])
			),
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return body.hits.hits.map((h: any) => {
		return {
			_score: h._score,
			...h._source,
		};
	});
};

interface IndexOptions {
	indexEvery: number;
	// includeReplies: boolean;
}
export const indexVideoComments = async (
	video: Video,
	{ indexEvery }: IndexOptions = { indexEvery: 250 }
): Promise<void> => {
	let newComments: Comment[] | undefined = undefined;
	do {
		try {
			newComments = await video.nextComments();
			if (newComments.length > 0 && video.comments.length >= indexEvery) {
				await saveIndex(video.comments);
				video.comments = [];
			}
		} catch (err) {
			break;
		}
	} while (!newComments || newComments.length > 0);
	if (video.comments.length) await saveIndex(video.comments);
};

export default es;
