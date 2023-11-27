# Description: Send ADA to all services
# Change 1..1 to 1..n if you have more than one service

for i in {1..1} ; do
  docker exec cardanoservice-cardanoservice-$i bun run send-ada
  sleep 60
  docker exec cardanoservice-cardanoservice-$i bun run send-ada
  sleep 60
done

for i in {1..1} ; do
  docker exec cardanoservice-cardanoerrorservice-$i bun run send-ada
  sleep 60
  docker exec cardanoservice-cardanoerrorservice-$i bun run send-ada
  sleep 60
done

# for i in {1..1} ; do
#   docker exec cardanoservice-cardanocontractservice-$i bun run send-ada
#   sleep 60
# done