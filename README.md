# Youtube Comment Searcher

**Disclaimer: This app is not built for production, this is made for learning purposes**

Feel free to use / modify it as you wish

## What does this app do?

1. Indexes Youtube comments in a video to ElasticSearch by sending a `POST` request to `/videos/{videoId}/comments/index`
2. Searches for indexed Youtube comments in a video by sending a `GET` request to `/videos/{videoId}/comments/index?q=keyword`

## Technologies

1. [React](https://reactjs.org/) (with [Hooks](https://reactjs.org/docs/hooks-intro.html) and [MaterialUI](https://material-ui.com/))
2. [Elasticsearch](https://opendistro.github.io/for-elasticsearch/) (Open Distro)
3. [NginX](https://www.nginx.com/)
4. [Express](https://expressjs.com/)
5. [Docker](https://www.docker.com/)

## Installation

1. Clone this repository:
```
git clone https://github.com/SuspiciousLookingOwl/youtube-comment-searcher
```
2. Modify `.env` if needed
3. Run docker compose
```
cd youtube-comment-searcher
docker-compose up
```
4. Open the web app from `localhost:3000` (Default port is `3000`)

**Note:** By default the data stored in Elasticsearch are not persistent, to make the data persistent, modify [docker-compose.yml](./docker-compose.yml) file to use [volume](https://docs.docker.com/storage/volumes/)

## Room for Improvement

- Use [virtualized list](https://material-ui.com/components/lists/#virtualized-list) for better UI performance
- [Use non-admin user for Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/get-started-users.html)
- [Run Elasticsearch in multi-node cluster](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html#docker-compose-file) (probably not necessary)