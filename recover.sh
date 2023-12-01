# https://stackoverflow.com/questions/22907231/how-to-copy-files-from-host-to-docker-container

# Description: Copy MNEMONIC to our machine
# Change 1..1 to 1..n if you have more than one service

if [ ! -d "./backup" ]; then
  mkdir ./backup
fi

for i in {1..5} ; do
  docker cp ./backup/cardanoservice-$i-mnemonics-test.json cardanoservice-cardanoservice-$i:/home/app/core/config/mnemonics-test.json
done

for i in {1..5} ; do
  docker cp ./backup/cardanocontractservice-$i-mnemonics-test.json cardanoservice-cardanocontractservice-$i:/home/app/core/config/mnemonics-test.json
done

for i in {1..5} ; do
  docker cp ./backup/cardanoerrorservice-$i-mnemonics-test.json cardanoservice-cardanoerrorservice-$i:/home/app/core/config/mnemonics-test.json
done