import { useEffect, useRef, useState } from "react";
import {
	TextField,
	Typography,
	Grid,
	Box,
	Divider,
	CircularProgress,
} from "@material-ui/core";
import { CommentRenderer, Comment, VideoRenderer, Video } from "../components";
import debounce from "../common/debounce";
import { getVideo, searchComments } from "../api";
import { useDebouncedEffect } from "./hooks";

function useComments() {
	const [page, setPage] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadedAll, setIsLoadedAll] = useState(false);
	const [comments, setComments] = useState<Comment[]>([]);

	function resetPage() {
		setIsLoadedAll(false);
		setComments([]);
		setPage(0);
	}

	function nextPage() {
		if (isLoadedAll || isLoading) return;
		setPage((page) => page + 1);
	}

	return {
		page,
		setPage,
		isLoading,
		setIsLoading,
		setIsLoadedAll,
		comments,
		setComments,
		resetPage,
		nextPage,
	};
}

function Home() {
	const [videoId, setVideoId] = useState("");
	const [keyword, setKeyword] = useState("");
	const [debouncedKeyword, setDebouncedKeyword] = useState("");
	const [video, setVideo] = useState<Video | null>(null);
	const commentList = useRef<HTMLDivElement | null>(null);
	const {
		comments,
		setComments,
		page,
		nextPage,
		isLoading,
		setIsLoading,
		setIsLoadedAll,
		resetPage,
	} = useComments();

	/** Listen to scroll handler */
	useEffect(() => {
		window.addEventListener("scroll", handleScroll);

		return function cleanup() {
			window.removeEventListener("scroll", handleScroll);
		};
	});

	/** videoId Watcher */
	useDebouncedEffect(
		() => {
			loadVideo();
		},
		500,
		[videoId]
	);

	/** debouncedKeyword watcher */
	useDebouncedEffect(
		() => {
			resetPage();
			setKeyword(debouncedKeyword);
		},
		500,
		[debouncedKeyword]
	);

	/** Fetch comments if page / keyword changed */
	useEffect(() => {
		async function loadComments() {
			if (!keyword || !video) return;
			if (page === 0) return nextPage();
			setIsLoading(true);
			const perPage = 20;
			const newComments = await searchComments(video.id, {
				keyword,
				page,
				perPage,
			});
			if (newComments) {
				if (newComments.length < perPage) setIsLoadedAll(true);
				else setIsLoadedAll(false);
				setComments((comments) => [...comments, ...newComments]);
			}
			setIsLoading(false);
		}
		loadComments();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [setComments, page, setIsLoadedAll, video, keyword]);

	/** Fetch data from API and load it to state */
	async function loadVideo() {
		if (!videoId) return;
		const video = await getVideo(videoId);
		setVideo(video);
		resetPage();
	}

	/** Scroll handler, if near bottom load next comment page */
	const handleScroll = debounce(async () => {
		if (!commentList?.current) return;
		const nearBottom =
			window.innerHeight -
				commentList.current.getBoundingClientRect().bottom >=
			-100;
		if (nearBottom) nextPage();
	}, 200);

	return (
		<div>
			<Typography variant="h6">Enter Youtube ID / Video URL</Typography>
			<TextField
				value={videoId}
				onChange={(e) => {
					let videoId = e.target.value;
					if (videoId.startsWith("http"))
						videoId = new URL(videoId).searchParams.get("v") || "";
					setVideoId(videoId);
				}}
				fullWidth
				variant="outlined"
			/>
			{video && (
				<div ref={commentList}>
					<Box my={2}>
						<VideoRenderer
							video={video}
							onIndexFinish={loadVideo}
						/>
					</Box>
					<Box my={2}>
						<Divider />
					</Box>
					<TextField
						label="Search Comments"
						value={debouncedKeyword}
						onChange={(e) => setDebouncedKeyword(e.target.value)}
						variant="outlined"
					/>
					<div>
						{comments.map((comment: Comment) => {
							return (
								<Box py={2} key={comment.id}>
									<CommentRenderer
										comment={comment}
										highlightedWords={keyword}
									/>
								</Box>
							);
						})}
					</div>

					{isLoading && (
						<Box pt={2}>
							<Grid
								container
								spacing={0}
								direction="column"
								alignItems="center"
								justify="center"
							>
								<Grid item xs={3}>
									<CircularProgress />
								</Grid>
							</Grid>
						</Box>
					)}
				</div>
			)}
		</div>
	);
}

export default Home;
