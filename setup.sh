db_folder="$HOME/.timetracker-mysql"
docker_compose_template="$(< docker-compose.template.yaml)"

mkdir -p "$db_folder"

docker_compose="${docker_compose_template//<db_folder>/$db_folder}"

echo "$docker_compose" > docker-compose.yaml