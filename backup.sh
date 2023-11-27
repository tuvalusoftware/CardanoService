# https://stackoverflow.com/questions/22907231/how-to-copy-files-from-host-to-docker-container

# Description: Copy MNEMONIC to our machine
# Change 1..1 to 1..n if you have more than one service

if [ ! -d "./backup" ]; then
  mkdir ./backup
fi

for i in {1..1} ; do
  docker cp cardanoservice-cardanoservice-$i:/home/app/core/config/mnemonics-test.json ./backup/cardanoservice-$i-mnemonics-test.json
done