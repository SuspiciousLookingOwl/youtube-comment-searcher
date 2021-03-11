import axios from "axios";

axios.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		return error;
	}
);

const port = process.env.REACT_APP_API_PORT || 3030;
const VIDEO_BASE_URL = `http://localhost:${port}/videos`;

export interface SearchCommentOptions {
	keyword: string;
	page: number;
	perPage: number;
}

export const searchComments = async (
	videoId: string,
	options: Partial<SearchCommentOptions>
) => {
	options = {
		keyword: "",
		page: 1,
		perPage: 20,
		...options,
	};

	const response = await axios.get(`${VIDEO_BASE_URL}/${videoId}/comments`, {
		params: {
			q: options.keyword,
			page: options.page,
			perPage: options.perPage,
		},
	});
	return response.data;
};

export const indexVideoComments = async (videoId: string) => {
	return await axios.post(`${VIDEO_BASE_URL}/${videoId}/index`);
};

export const getVideo = async (videoId: string) => {
	return (await axios.get(`${VIDEO_BASE_URL}/${videoId}`)).data;
};
