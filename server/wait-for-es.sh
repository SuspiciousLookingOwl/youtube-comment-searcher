set -e

host="$1"
shift
cmd="$@"

until curl https://$host --insecure -u "$ELASTICSEARCH_USERNAME:$ELASTICSEARCH_PASSWORD"; do
  >&2 echo "Elasticsearch is unavailable - sleeping"
  sleep 10
done

>&2 echo "Elasticsearch is up - executing command in 10 seconds"
exec $cmd